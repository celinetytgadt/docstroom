/**
 * @OnlyCurrentDoc
 *
 * Documentenstroom – opslag in Google Sheets
 *
 * Toestemmingen: het script kan ALLEEN de spreadsheet lezen en bewerken waarin het
 * geïnstalleerd is (scope spreadsheets.currentonly). Geen toegang tot Drive,
 * andere bestanden, Gmail of je account.
 *
 * Installatie: zie apps-script/INSTALLATIE.md
 * 1. Pas hieronder LEERKRACHT_WACHTWOORD aan.
 * 2. Implementeren → Nieuwe implementatie → Web-app
 *    (Uitvoeren als: ikzelf · Wie heeft toegang: iedereen).
 */

const LEERKRACHT_WACHTWOORD = 'verander-mij';

const TAB = 'Resultaten';
const HEADERS = [
  'Naam', 'Pincode', 'Status', 'Controles', 'Juist 1e controle', 'Juist einde', 'Op',
  'Inschatting', 'Juist → fout', 'Gestart', 'Laatst bijgewerkt', 'Resultaatcode', 'Toestand (niet aanpassen)'
];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

// Historiek: één rij per keer dat een leerling op Controleer klikt (basis en herkansing)
const HIST_TAB = 'Controles';
const HIST_HEADERS = [
  'Naam', 'Versie', 'Controle', 'Tijdstip', 'Juist', 'Op',
  'Volgorde (op 8)', 'Naam (op 8)', 'Wat is het? (op 8)', 'Van wie? Voor wie? (op 8)', 'Wat is de inhoud? (op 8)'
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'Ongeldige aanvraag.' });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (body.action) {
      case 'start': return json(start(body));
      case 'save': return json(save(body));
      case 'list': return json(list(body));
      case 'delete': return json(remove(body));
      default: return json({ ok: false, error: 'Onbekende actie.' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, app: 'documentenstroom' });
}

/* ---------- acties ---------- */

// Leerling start of gaat verder: naam + pincode
function start(b) {
  const naam = clean(b.naam);
  const pin = clean(b.pin);
  if (!naam || !/^\d{4}$/.test(pin)) return { ok: false, error: 'Vul je naam en een pincode van 4 cijfers in.' };
  const sh = sheet();
  const r = findRow(sh, naam);
  if (!r) {
    const now = new Date();
    sh.appendRow([naam, "'" + pin, 'bezig', 0, '', '', '', '', '', now, now, '', '']);
    return { ok: true, status: 'new' };
  }
  const vals = sh.getRange(r, 1, 1, HEADERS.length).getValues()[0];
  if (pinOf(vals[COL['Pincode'] - 1]) !== pin) {
    return { ok: false, error: 'Deze naam is al in gebruik met een andere pincode. Kijk je pincode na of vraag het aan je leerkracht.' };
  }
  const stateText = vals[COL['Toestand (niet aanpassen)'] - 1];
  return { ok: true, status: 'resume', state: stateText ? JSON.parse(stateText) : null };
}

// Toestand van een leerling bewaren (na wijzigingen en na elke controle)
function save(b) {
  const naam = clean(b.naam);
  const pin = clean(b.pin);
  const s = b.summary || {};
  if (!naam || !/^\d{4}$/.test(pin)) return { ok: false, error: 'Naam of pincode ontbreekt.' };
  const sh = sheet();
  let r = findRow(sh, naam);
  if (r) {
    const oldPin = pinOf(sh.getRange(r, COL['Pincode']).getValue());
    if (oldPin !== pin) return { ok: false, error: 'Pincode klopt niet.' };
  } else {
    sh.appendRow([naam, "'" + pin]);
    r = sh.getLastRow();
  }
  const row = [
    naam, "'" + pin, s.status || 'bezig', s.n || 0, s.first === undefined ? '' : s.first,
    s.last === undefined ? '' : s.last, s.total || '', s.verdict || '', s.flips || 0,
    s.start ? new Date(s.start) : new Date(), new Date(), s.code || '', JSON.stringify(b.state || null)
  ];
  sh.getRange(r, 1, 1, row.length).setValues([row]);
  logHistory(naam, b.state);
  return { ok: true };
}

// Leerkracht: alle resultaten ophalen
function list(b) {
  if (b.wachtwoord !== LEERKRACHT_WACHTWOORD) return { ok: false, error: 'Wachtwoord klopt niet.' };
  const sh = sheet();
  const n = sh.getLastRow() - 1;
  if (n < 1) return { ok: true, rows: [] };
  const vals = sh.getRange(2, 1, n, HEADERS.length).getValues();
  const rows = vals.filter(v => v[0]).map(v => ({
    naam: String(v[COL['Naam'] - 1]),
    pin: pinOf(v[COL['Pincode'] - 1]),
    status: String(v[COL['Status'] - 1]),
    updated: v[COL['Laatst bijgewerkt'] - 1] instanceof Date ? v[COL['Laatst bijgewerkt'] - 1].getTime() : null,
    code: String(v[COL['Resultaatcode'] - 1] || '')
  }));
  return { ok: true, rows };
}

// Leerkracht: leerling wissen zodat die opnieuw kan beginnen
function remove(b) {
  if (b.wachtwoord !== LEERKRACHT_WACHTWOORD) return { ok: false, error: 'Wachtwoord klopt niet.' };
  const sh = sheet();
  const naam = clean(b.naam);
  const r = findRow(sh, naam);
  if (r) sh.deleteRow(r);
  markHistoryDeleted(naam);
  return { ok: true };
}

/* ---------- historiek per controle ---------- */

// Voegt de controles toe die nog niet in het tabblad Controles staan.
function logHistory(naam, state) {
  const attempts = (state && state.attempts) || [];
  if (!attempts.length) return;
  const sh = histSheet();
  const done = loggedCount(sh, naam);
  if (attempts.length <= done) return;
  const versie = /\(herkansing\)$/i.test(naam) || state.mode === 'herkansing' ? 'herkansing' : 'basis';
  const rows = attempts.slice(done).map((a, i) => {
    const sc = scoreAttempt(a.p);
    const per = [0, 1, 2, 3].map(t => sc.per[t] === undefined ? '' : sc.per[t]);
    return [naam, versie, done + i + 1, a.t ? new Date(a.t) : new Date(), sc.total, sc.max, sc.pos].concat(per);
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HIST_HEADERS.length).setValues(rows);
}

// Een poging is "volgorde:kaartjes". De volgorde van de documenten in de app is de oplossing:
// op plaats i hoort document i, en bij document j horen de kaartjes van document j.
function scoreAttempt(p) {
  const parts = String(p || '').split(':');
  const o = parts[0] || '';
  const a = parts[1] || '';
  const n = o.length;
  const types = n ? Math.round(a.length / n) : 0;
  let pos = 0;
  for (let i = 0; i < n; i++) if (Number(o[i]) === i) pos++;
  const per = [];
  for (let t = 0; t < types; t++) {
    let ok = 0;
    for (let j = 0; j < n; j++) {
      const ch = a[j * types + t];
      if (ch !== undefined && ch !== '-' && Number(ch) === j) ok++;
    }
    per.push(ok);
  }
  return { pos, per, total: per.reduce((x, y) => x + y, pos), max: n * (1 + types) };
}

// Hoeveel controles van deze leerling staan er al (gewiste pogingen niet meegeteld)?
function loggedCount(sh, naam) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const key = naam.toLowerCase();
  const vals = sh.getRange(2, 1, n, 3).getValues();
  let max = 0;
  vals.forEach(v => {
    if (String(v[0]).trim().toLowerCase() === key && !/gewist/.test(String(v[1]))) max = Math.max(max, Number(v[2]) || 0);
  });
  return max;
}

// Bij "Leerling wissen" blijft de historiek staan, gemarkeerd als gewist.
function markHistoryDeleted(naam) {
  const sh = histSheet();
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const key = naam.toLowerCase();
  const vals = sh.getRange(2, 1, n, 2).getValues();
  vals.forEach((v, i) => {
    const versie = String(v[1]);
    if (String(v[0]).trim().toLowerCase() === key && !/gewist/.test(versie)) {
      sh.getRange(i + 2, 2).setValue(versie + ' (gewist)');
    }
  });
}

/* ---------- hulpfuncties ---------- */

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e8eef9');
    sh.setFrozenRows(1);
    sh.getRange('B:B').setNumberFormat('@');
    sh.setColumnWidth(COL['Resultaatcode'], 160);
    sh.setColumnWidth(COL['Toestand (niet aanpassen)'], 160);
  }
  return sh;
}

function histSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HIST_TAB);
  if (!sh) {
    sh = ss.insertSheet(HIST_TAB);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HIST_HEADERS);
    sh.getRange(1, 1, 1, HIST_HEADERS.length).setFontWeight('bold').setBackground('#e8eef9');
    sh.setFrozenRows(1);
    sh.getRange('D:D').setNumberFormat('dd/mm/yyyy hh:mm');
  }
  return sh;
}

function findRow(sh, naam) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return null;
  const key = naam.toLowerCase();
  const names = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < names.length; i++) {
    if (String(names[i][0]).trim().toLowerCase() === key) return i + 2;
  }
  return null;
}

function pinOf(v) {
  return String(v == null ? '' : v).replace(/^'/, '').trim().padStart(4, '0');
}

function clean(s) {
  return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').slice(0, 80);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Eenmalig uitvoeren vanuit de editor om toestemming te geven en de tabbladen aan te maken.
function installeer() {
  sheet();
  histSheet();
}

// Eenmalig uitvoeren vanuit de editor: zet de controles die vóór deze versie gebeurden
// ook in het tabblad Controles. Opnieuw uitvoeren kan geen kwaad (er komt niets dubbel).
function historiekAanvullen() {
  const sh = sheet();
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const vals = sh.getRange(2, 1, n, HEADERS.length).getValues();
  vals.forEach(v => {
    const naam = String(v[COL['Naam'] - 1]).trim();
    const text = v[COL['Toestand (niet aanpassen)'] - 1];
    if (!naam || !text) return;
    try { logHistory(naam, JSON.parse(text)); } catch (e) { /* rij overslaan */ }
  });
}
