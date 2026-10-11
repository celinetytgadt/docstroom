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
  const r = findRow(sh, clean(b.naam));
  if (r) sh.deleteRow(r);
  return { ok: true };
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

// Eenmalig uitvoeren vanuit de editor om toestemming te geven en het tabblad aan te maken.
function installeer() {
  sheet();
}
