/* Documentenstroom – leerlingenapp */
(function () {
  'use strict';

  const { DOCS, TYPES, IDS, NAME, TOTAL } = window.DS;
  const DOC = Object.fromEntries(DOCS.map(d => [d.id, d]));
  const TYPE = Object.fromEntries(TYPES.map(t => [t.id, t]));
  const ZONE_TYPES = TYPES.filter(t => t.id !== 'naam');
  const KEY = 'ds-session-v1';
  const ARCHIVE_KEY = 'ds-archive-v1';
  const CARD_COUNT = DOCS.length * TYPES.length;

  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  let S = null;            // sessie
  let tab = 'naam';
  let sel = null;          // selectie (klikmodus)
  let poolCollapsed = false;

  /* ---------- opslag ---------- */
  function save() {
    if (!S) return;
    S.updated = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* geen opslag beschikbaar */ }
    if (ONLINE && S.pin) { pending = true; scheduleSync(); }
  }

  /* ---------- online opslag (Google Sheet via Apps Script) ---------- */
  const URL_ = (window.DS_CONFIG && window.DS_CONFIG.scriptUrl || '').trim();
  const ONLINE = !!URL_;
  const CLASSROOM = (window.DS_CONFIG && window.DS_CONFIG.classroomUrl || '').trim();
  let pending = false;
  let syncing = false;
  let syncTimer = null;

  function api(body) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' })
      .then(r => r.json());
  }
  function summary() {
    const sess = { naam: S.naam, klas: '', start: S.start, end: S.end, done: S.done && !S.handedIn, attempts: S.attempts, restarts: S.restarts || 0 };
    const an = window.DS.analyse(sess);
    return {
      status: S.done ? (S.handedIn ? 'ingeleverd' : 'alles juist') : 'bezig',
      n: an.n, first: an.n ? an.first : '', last: an.n ? an.last : '', total: TOTAL,
      verdict: window.DS.verdict(an).label, flips: an.flips, start: S.start,
      code: window.DS.encodeResult(sess)
    };
  }
  function payload() {
    return { action: 'save', naam: S.naam, pin: S.pin, state: S, summary: summary() };
  }
  function setSync(kind, text) {
    const e = $('syncStatus');
    if (!e) return;
    e.hidden = !ONLINE;
    e.className = `sync ${kind}`;
    e.textContent = text;
  }
  function scheduleSync() {
    clearTimeout(syncTimer);
    setSync('busy', 'Niet opgeslagen…');
    syncTimer = setTimeout(syncNow, 4000);
  }
  function syncNow() {
    clearTimeout(syncTimer);
    if (!ONLINE || !S || !S.pin || !pending) return Promise.resolve();
    if (syncing) { syncTimer = setTimeout(syncNow, 1500); return Promise.resolve(); }
    syncing = true;
    pending = false;
    setSync('busy', 'Opslaan…');
    return api(payload()).then(res => {
      syncing = false;
      if (res && res.ok) setSync('ok', '✓ Opgeslagen');
      else { setSync('err', '⚠ ' + ((res && res.error) || 'Niet opgeslagen')); }
    }).catch(() => {
      syncing = false;
      pending = true;
      setSync('err', '⚠ Geen verbinding, je werk staat op deze computer');
    });
  }
  setInterval(() => { if (pending && !syncing) syncNow(); }, 20000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pending && ONLINE && S && S.pin && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(URL_, JSON.stringify(payload()))) pending = false; } catch (e) { /* negeren */ }
    }
  });
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function archive(old) {
    if (!old || !old.attempts || !old.attempts.length || old.done) return;
    try {
      const list = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
      list.push({ naam: old.naam, n: old.attempts.length, start: old.start });
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list.slice(-50)));
    } catch (e) { /* negeren */ }
  }
  function restartsFor(naam) {
    try {
      const list = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
      const n = naam.trim().toLowerCase();
      return list.filter(x => (x.naam || '').trim().toLowerCase() === n).length;
    } catch (e) { return 0; }
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function newSession(naam) {
    let order;
    do { order = shuffle(IDS); } while (order.filter((id, i) => IDS[i] === id).length > 1);
    const attach = {};
    IDS.forEach(id => { attach[id] = {}; TYPES.forEach(t => { attach[id][t.id] = null; }); });
    const pool = {};
    TYPES.forEach(t => { pool[t.id] = shuffle(IDS); });
    return {
      naam, start: Date.now(), end: null, done: false, handedIn: false,
      restarts: restartsFor(naam),
      order, attach, pool, attempts: [], marks: null
    };
  }

  /* ---------- helpers voor de toestand ---------- */
  function placedCount() {
    let n = 0;
    IDS.forEach(id => TYPES.forEach(t => { if (S.attach[id][t.id]) n++; }));
    return n;
  }
  function whereIs(cardDoc, type) {
    return IDS.find(id => S.attach[id][type] === cardDoc) || null;
  }
  function clearCardMark(doc, type) {
    if (S.marks && S.marks.card[doc]) delete S.marks.card[doc][type];
  }
  function clearPosMarks() {
    if (S.marks) S.marks.pos = {};
  }

  function placeCard(cardDoc, type, targetDoc) {
    const from = whereIs(cardDoc, type);
    if (from === targetDoc) return;
    if (from) {
      S.attach[from][type] = null;
      clearCardMark(from, type);
    }
    // Een kaartje dat al in het vak lag, gaat terug naar de stapel
    S.attach[targetDoc][type] = cardDoc;
    clearCardMark(targetDoc, type);
    commit();
  }
  function removeCard(doc, type) {
    S.attach[doc][type] = null;
    clearCardMark(doc, type);
    commit();
  }
  function moveDoc(doc, toIndex) {
    const from = S.order.indexOf(doc);
    if (from === toIndex || toIndex < 0 || toIndex >= S.order.length) return;
    S.order.splice(from, 1);
    S.order.splice(toIndex, 0, doc);
    clearPosMarks();
    commit();
  }
  function commit() {
    sel = null;
    save();
    render();
  }

  /* ---------- weergave ---------- */
  const paperCache = {};
  function paper(id) {
    const p = el('div', 'paper', DOC[id].html);
    p.setAttribute('aria-hidden', 'true');
    return p;
  }
  function thumbPaper(id) {
    if (!paperCache[id]) paperCache[id] = paper(id);
    return paperCache[id];
  }

  function cardEl(cardDoc, type, opts = {}) {
    const d = DOC[cardDoc];
    const t = TYPE[type];
    const b = el('div', `card t-${type}`);
    b.tabIndex = 0;
    b.setAttribute('role', 'button');
    b.dataset.drag = 'card';
    b.dataset.card = cardDoc;
    b.dataset.type = type;
    const body = type === 'naam' ? d.naam : d[type];
    b.innerHTML = `<span class="chip">${t.label}</span>${body}`;
    b.setAttribute('aria-label', type === 'naam' ? `Kaartje naam: ${d.naam}` : `Kaartje ${t.label}`);
    if (sel && sel.kind === 'card' && sel.card === cardDoc && sel.type === type) b.classList.add('selected');
    if (opts.zoneDoc) {
      const x = el('button', 'remove', '×');
      x.type = 'button';
      x.title = 'Terug naar de stapel';
      x.setAttribute('aria-label', 'Terug naar de stapel');
      x.dataset.action = 'remove';
      x.dataset.doc = opts.zoneDoc;
      x.dataset.type = type;
      b.appendChild(x);
    }
    return b;
  }

  function zoneEl(doc, type) {
    const z = el('div', `zone ${type}`);
    z.dataset.drop = 'zone';
    z.dataset.doc = doc;
    z.dataset.type = type;
    const c = S.attach[doc][type];
    const mark = S.marks && S.marks.card[doc] ? S.marks.card[doc][type] : undefined;
    if (c) {
      z.classList.add('filled');
      if (mark === true) z.classList.add('ok');
      if (mark === false) z.classList.add('bad');
      z.appendChild(cardEl(c, type, { zoneDoc: doc }));
      if (mark === false) z.appendChild(el('span', 'mark', '✗ Niet juist'));
      if (mark === true) z.appendChild(el('span', 'mark', '✓ Juist'));
    } else {
      const b = el('button', 'zone-empty', `+ ${TYPE[type].label}`);
      b.type = 'button';
      b.dataset.action = 'zone';
      b.dataset.doc = doc;
      b.dataset.type = type;
      z.appendChild(b);
    }
    const isTarget = (sel && sel.kind === 'card' && sel.type === type) ||
                     (sel && sel.kind === 'zone' && sel.doc === doc && sel.type === type);
    if (isTarget) z.classList.add('target');
    return z;
  }

  function renderStream() {
    const ol = $('stream');
    ol.innerHTML = '';
    S.order.forEach((doc, i) => {
      const li = el('li', 'row');
      li.dataset.drop = 'row';
      li.dataset.index = i;
      li.dataset.doc = doc;
      const pm = S.marks ? S.marks.pos[doc] : undefined;
      if (pm === true) li.classList.add('pos-ok');
      if (pm === false) li.classList.add('pos-bad');
      if (sel && sel.kind === 'doc' && sel.doc === doc) li.classList.add('selected');

      const slot = el('div', 'slot');
      slot.appendChild(el('div', 'slot-no', String(i + 1)));
      const up = el('button', 'arrow', '▲');
      up.type = 'button'; up.dataset.action = 'up'; up.dataset.doc = doc; up.disabled = i === 0;
      up.setAttribute('aria-label', `Document op plaats ${i + 1} omhoog`);
      const grip = el('button', 'grip', '⠿');
      grip.type = 'button'; grip.dataset.drag = 'doc'; grip.dataset.doc = doc; grip.dataset.action = 'grip';
      grip.title = 'Sleep of klik om te verplaatsen';
      grip.setAttribute('aria-label', `Document op plaats ${i + 1} verplaatsen`);
      const down = el('button', 'arrow', '▼');
      down.type = 'button'; down.dataset.action = 'down'; down.dataset.doc = doc; down.disabled = i === S.order.length - 1;
      down.setAttribute('aria-label', `Document op plaats ${i + 1} omlaag`);
      slot.append(up, grip, down);
      if (pm === false) slot.appendChild(el('span', 'mark', ''));

      const box = el('div', 'docbox');
      const th = el('button', 'thumb');
      th.type = 'button';
      th.dataset.drag = 'doc';
      th.dataset.doc = doc;
      th.dataset.action = 'zoom';
      th.setAttribute('aria-label', `Document op plaats ${i + 1} vergroten`);
      th.appendChild(thumbPaper(doc));
      th.appendChild(el('span', 'zoom-hint', '🔍 vergroot'));
      box.append(th, zoneEl(doc, 'naam'));

      const zones = el('div', 'zones');
      ZONE_TYPES.forEach(t => zones.appendChild(zoneEl(doc, t.id)));

      li.append(slot, box, zones);
      ol.appendChild(li);
    });
  }

  function renderPool() {
    const tabs = $('tabs');
    tabs.innerHTML = '';
    TYPES.forEach(t => {
      const left = S.pool[t.id].filter(c => !whereIs(c, t.id)).length;
      // Groen kader: bij de laatste controle lagen alle kaartjes van deze soort juist
      const allOk = !!S.marks && IDS.every(id => S.marks.card[id] && S.marks.card[id][t.id] === true);
      const b = el('button', `tab t-${t.id}${allOk ? ' all-ok' : ''}`,
        `<span>${t.short}</span><span class="count">${allOk ? '✓ alles juist' : `${left} over`}</span>`);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(tab === t.id));
      b.dataset.action = 'tab';
      b.dataset.type = t.id;
      tabs.appendChild(b);
    });
    const list = $('poolList');
    list.innerHTML = '';
    const cards = S.pool[tab].filter(c => !whereIs(c, tab));
    if (!cards.length) {
      list.appendChild(el('p', 'pool-empty', `Alle kaartjes “${TYPE[tab].label}” liggen bij een document.`));
    }
    cards.forEach(c => list.appendChild(cardEl(c, tab)));

    let hint = 'Kies een kaartje en leg het bij een document.';
    if (sel && sel.kind === 'zone') hint = `Kies nu het kaartje voor het gekozen vak (${TYPE[sel.type].label}).`;
    if (sel && sel.kind === 'card') hint = 'Klik nu op een vak bij een document. Klik op de stapel om te annuleren.';
    if (sel && sel.kind === 'doc') hint = 'Klik op de plaats waar het document moet komen.';
    $('poolHint').textContent = hint;
    $('pool').classList.toggle('collapsed', poolCollapsed);
    $('workspace').classList.toggle('pool-collapsed', poolCollapsed);
    $('poolToggle').textContent = poolCollapsed ? 'Tonen' : 'Verbergen';
    $('poolToggle').setAttribute('aria-expanded', String(!poolCollapsed));
  }

  function renderStatus() {
    const n = placedCount();
    $('who').textContent = S.naam;
    $('placedCount').textContent = `${n}/${CARD_COUNT}`;
    $('progressBar').style.width = `${(n / CARD_COUNT) * 100}%`;
    $('attemptCount').textContent = String(S.attempts.length);
    const btn = $('checkBtn');
    btn.disabled = n < CARD_COUNT;
    btn.title = n < CARD_COUNT ? `Nog ${CARD_COUNT - n} kaartjes leggen` : '';
    $('handInBtn').hidden = S.attempts.length === 0;
  }

  function render() {
    if (!S) return;
    renderStream();
    renderPool();
    renderStatus();
  }

  function showFeedback(kind, html) {
    const f = $('feedback');
    f.className = `feedback ${kind}`;
    f.innerHTML = html;
    f.hidden = false;
  }

  /* ---------- schermen ---------- */
  function show(screen) {
    $('start').hidden = screen !== 'start';
    $('work').hidden = screen !== 'work';
    $('result').hidden = screen !== 'result';
    window.scrollTo(0, 0);
  }

  function showStart() {
    const old = load();
    if (old && !old.done) {
      $('resumeBox').hidden = false;
      $('resumeText').textContent = `${old.naam} was al bezig: ${old.attempts.length} controle(s).`;
      $('naam').value = old.naam;
    } else {
      $('resumeBox').hidden = true;
    }
    show('start');
  }

  function startWork() {
    show('work');
    $('help').open = S.attempts.length === 0;
    if (S.attempts.length && S.marks) {
      showFeedback('bad', `<p>Je bent terug. Laatste controle: poging ${S.attempts.length}. Verbeter de rode onderdelen.</p>`);
    } else {
      $('feedback').hidden = true;
    }
    render();
  }

  /* ---------- controleren ---------- */
  function check() {
    if (placedCount() < CARD_COUNT) return;
    const ev = window.DS.evaluate(S.order, S.attach);
    S.attempts.push({ t: Date.now(), p: window.DS.packAttempt(S.order, S.attach) });
    S.marks = { pos: ev.pos, card: JSON.parse(JSON.stringify(ev.card)) };
    if (ev.score === TOTAL) {
      S.done = true;
      S.end = Date.now();
      save();
      syncNow();
      showResult();
      return;
    }
    save();
    syncNow();
    const posWrong = IDS.filter(id => !ev.pos[id]).length;
    const cardWrong = TOTAL - DOCS.length - (ev.score - (DOCS.length - posWrong));
    showFeedback('bad', `
      <p><b>${ev.score} van ${TOTAL} juist</b> na poging ${S.attempts.length}.
      ${posWrong ? `${posWrong} document${posWrong > 1 ? 'en staan' : ' staat'} niet op de juiste plaats (rood nummer).` : 'De volgorde is juist.'}
      ${cardWrong ? `${cardWrong} kaartje${cardWrong > 1 ? 's liggen' : ' ligt'} fout (rode rand).` : 'Alle kaartjes liggen juist.'}</p>
      <p>Verbeter wat rood is en controleer opnieuw.</p>`);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handIn() {
    confirmBox(
      'Inleveren?',
      'Je levert in zonder dat alles juist is. Daarna kan je niet meer verder werken. Je leerkracht ziet je laatste controle.',
      'Ja, inleveren',
      () => {
        S.done = true;
        S.handedIn = true;
        S.end = Date.now();
        save();
        syncNow();
        showResult();
      });
  }

  /* ---------- eindscherm ---------- */
  function fmtTime(ms) {
    const m = Math.round(ms / 60000);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} u ${m % 60} min`;
  }

  function matrixHtml(an) {
    const cols = [{ id: 'pos', label: 'Volgorde' }].concat(TYPES.map(t => ({ id: t.id, label: t.short })));
    const cell = x => {
      if (x.solvedAt === null) return '<span class="pill bad">✗</span>';
      const cls = x.solvedAt === 1 ? 'good' : x.solvedAt === 2 ? 'warn' : 'bad';
      return `<span class="pill ${cls}">${x.solvedAt}</span>`;
    };
    return `
      <div class="matrix-wrap"><table class="matrix">
        <thead><tr><th>Document</th>${cols.map(c => `<th class="c">${c.label}</th>`).join('')}</tr></thead>
        <tbody>${IDS.map((id, i) => `<tr><td>${i + 1}. ${NAME[id]}</td>${cols.map(c => `<td class="c">${cell(an.items[id][c.id])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="legend"><span>Getal = bij welke controle het juist was:</span>
        <span class="pill good">1</span> meteen <span class="pill warn">2</span> tweede keer <span class="pill bad">3+</span> later <span class="pill bad">✗</span> niet juist</div>`;
  }

  function showResult() {
    const session = {
      naam: S.naam, klas: '', start: S.start, end: S.end, done: S.done && !S.handedIn,
      attempts: S.attempts, restarts: S.restarts || 0
    };
    const code = window.DS.encodeResult(session);
    const an = window.DS.analyse(session);
    const v = window.DS.verdict(an);
    const allOk = !S.handedIn;
    const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    $('resultWrap').innerHTML = `
      <div class="result-head">
        <h1>${allOk ? 'Alles juist, goed gedaan!' : 'Ingeleverd'}</h1>
        <p>${esc(S.naam)} · ${new Date(S.end).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}</p>
        <div class="kpis">
          <div class="kpi"><b>${an.n}</b><span>controle${an.n === 1 ? '' : 's'}</span></div>
          <div class="kpi"><b>${an.first}/${TOTAL}</b><span>juist bij 1e controle</span></div>
          <div class="kpi"><b>${an.last}/${TOTAL}</b><span>juist op het einde</span></div>
          <div class="kpi"><b>${fmtTime(S.end - S.start)}</b><span>gewerkt</span></div>
        </div>
      </div>
      ${CLASSROOM ? `<div class="code-box classroom">
        <h2>Laatste stap: dien je taak in</h2>
        <p>Je resultaat is bewaard. Ga nu naar de taak in Google Classroom en klik op <b>Markeren als voltooid</b>. Pas dan weet je leerkracht dat je klaar bent.</p>
        <div><a class="btn primary" href="${esc(CLASSROOM)}" target="_blank" rel="noopener">Open de taak in Classroom</a></div>
      </div>` : ''}
      <h2>Jouw overzicht</h2>
      ${matrixHtml(an)}
      <details class="help teacher-box">
        <summary>Voor de leerkracht</summary>
        <div class="kpis">
          <div class="kpi"><b><span class="pill ${v.level}">${v.label}</span></b><span>inschatting</span></div>
          <div class="kpi"><b>${an.flips}</b><span>keer juist → fout</span></div>
          <div class="kpi"><b>${S.restarts || 0}</b><span>keer herbegonnen</span></div>
        </div>
        <div class="attempts">${an.evals.map((e, i) => `
          <div class="attempt">
            <h3>Controle ${i + 1} · ${e.ev.score}/${TOTAL} · ${new Date(S.attempts[i].t).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}</h3>
            ${e.errors.length ? `<ul>${e.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>Geen fouten.</p>'}
          </div>`).join('')}
        </div>
        <p class="muted">Resultaatcode (voor leerkracht.html):</p>
        <textarea id="codeText" readonly aria-label="Resultaatcode">${code}</textarea>
        <div class="code-actions">
          <button class="btn small" type="button" id="copyBtn">Kopieer code</button>
          <span class="copied" id="copiedMsg" hidden>Gekopieerd</span>
          <span class="spacer"></span>
          <button class="btn small ghost" type="button" id="newBtn">Nieuwe leerling starten</button>
        </div>
      </details>`;
    $('copyBtn').onclick = () => {
      const ta = $('codeText');
      const done = () => { $('copiedMsg').hidden = false; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, () => { ta.select(); document.execCommand('copy'); done(); });
      } else { ta.select(); document.execCommand('copy'); done(); }
    };
    $('newBtn').onclick = () => confirmBox(
      'Nieuwe leerling?',
      'Het resultaat van deze leerling wordt van deze computer gewist.',
      'Ja, nieuwe leerling',
      () => {
        try { localStorage.removeItem(KEY); } catch (e) { /* negeren */ }
        S = null;
        $('naam').value = '';
        showStart();
      });
    show('result');
  }

  /* ---------- modalen & toast ---------- */
  function openDoc(id) {
    const i = S.order.indexOf(id);
    $('docModalTitle').textContent = `Document op plaats ${i + 1}`;
    const body = $('docModalBody');
    body.innerHTML = '';
    body.appendChild(paper(id));
    $('docModal').hidden = false;
    $('docModalClose').focus();
  }
  let confirmCb = null;
  function confirmBox(title, text, yes, cb) {
    $('confirmTitle').textContent = title;
    $('confirmText').textContent = text;
    $('confirmYes').textContent = yes;
    confirmCb = cb;
    $('confirmModal').hidden = false;
    $('confirmNo').focus();
  }
  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* ---------- klikken ---------- */
  let suppressClick = false;

  function onClick(e) {
    if (suppressClick) { suppressClick = false; return; }
    if (!S || $('work').hidden) return;
    const a = e.target.closest('[data-action]');
    const cardNode = e.target.closest('.card');

    if (a && a.dataset.action === 'remove') { removeCard(a.dataset.doc, a.dataset.type); return; }
    if (a && a.dataset.action === 'tab') { tab = a.dataset.type; if (sel && sel.kind === 'zone') sel = null; render(); return; }
    if (a && a.dataset.action === 'up') { moveDoc(a.dataset.doc, S.order.indexOf(a.dataset.doc) - 1); return; }
    if (a && a.dataset.action === 'down') { moveDoc(a.dataset.doc, S.order.indexOf(a.dataset.doc) + 1); return; }

    // Een document is geselecteerd: klik op een rij = verplaats daarheen
    if (sel && sel.kind === 'doc') {
      const row = e.target.closest('.row');
      if (row) {
        if (row.dataset.doc === sel.doc) { sel = null; render(); return; }
        moveDoc(sel.doc, +row.dataset.index);
        toast('Document verplaatst');
        return;
      }
      sel = null; render(); return;
    }

    if (a && a.dataset.action === 'grip') { sel = { kind: 'doc', doc: a.dataset.doc }; render(); return; }
    if (a && a.dataset.action === 'zoom') { openDoc(a.dataset.doc); return; }

    if (cardNode) {
      const c = { card: cardNode.dataset.card, type: cardNode.dataset.type };
      const zone = cardNode.closest('.zone');
      // Eerst vak gekozen, nu kaartje uit de stapel
      if (sel && sel.kind === 'zone' && !zone) {
        if (sel.type === c.type) { placeCard(c.card, c.type, sel.doc); return; }
      }
      // Kaartje gekozen, klik op een kaartje in een vak = wisselen
      if (sel && sel.kind === 'card' && zone && sel.type === c.type && !(sel.card === c.card)) {
        placeCard(sel.card, sel.type, zone.dataset.doc);
        return;
      }
      if (sel && sel.kind === 'card' && sel.card === c.card && sel.type === c.type) { sel = null; render(); return; }
      sel = { kind: 'card', card: c.card, type: c.type };
      if (!zone) tab = c.type;
      render();
      return;
    }

    if (a && a.dataset.action === 'zone') {
      const { doc, type } = a.dataset;
      if (sel && sel.kind === 'card') {
        if (sel.type !== type) { toast(`Dit vak is voor “${TYPE[type].label}”`); return; }
        placeCard(sel.card, sel.type, doc);
        return;
      }
      sel = { kind: 'zone', doc, type };
      tab = type;
      if (poolCollapsed) poolCollapsed = false;
      render();
      return;
    }

    // Klik op de stapel met een gelegd kaartje geselecteerd = terugleggen
    if (sel && sel.kind === 'card' && e.target.closest('#pool')) {
      const from = whereIs(sel.card, sel.type);
      if (from) { removeCard(from, sel.type); return; }
    }
    if (sel && !e.target.closest('#pool .tabs')) { sel = null; render(); }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      if (!$('docModal').hidden) { $('docModal').hidden = true; return; }
      if (!$('confirmModal').hidden) { $('confirmModal').hidden = true; return; }
      if (sel) { sel = null; render(); }
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) {
      e.preventDefault();
      e.target.click();
    }
  }

  /* ---------- slepen (muis, pen en touch) ---------- */
  let drag = null;

  function onPointerDown(e) {
    if (!S || $('work').hidden) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.remove')) return;
    const src = e.target.closest('[data-drag]');
    if (!src) return;
    drag = {
      src, kind: src.dataset.drag, x: e.clientX, y: e.clientY, active: false,
      touch: e.pointerType === 'touch', ready: e.pointerType !== 'touch', ghost: null, over: null
    };
    if (drag.touch) {
      // Op touch: even vasthouden om te slepen, anders scrollen
      drag.timer = setTimeout(() => { if (drag) drag.ready = true; }, 180);
    }
  }

  function startDrag(e) {
    drag.active = true;
    const r = drag.src.getBoundingClientRect();
    let g;
    if (drag.kind === 'doc') {
      const doc = drag.src.dataset.doc;
      g = el('div', 'thumb drag-ghost');
      g.appendChild(thumbPaper(doc).cloneNode(true));
      g.style.width = '168px';
      g.style.height = '226px';
      drag.doc = doc;
      drag.offX = 40; drag.offY = 40;
    } else {
      g = drag.src.cloneNode(true);
      g.classList.add('drag-ghost');
      g.style.width = Math.min(r.width, 300) + 'px';
      drag.card = drag.src.dataset.card;
      drag.type = drag.src.dataset.type;
      drag.offX = Math.min(e.clientX - r.left, 280);
      drag.offY = Math.min(e.clientY - r.top, 40);
    }
    document.body.appendChild(g);
    drag.ghost = g;
    drag.src.classList.add('dragging-src');
    document.body.classList.add('dragging');
    sel = null;
    if (drag.kind === 'card') {
      document.querySelectorAll(`.zone.${drag.type}`).forEach(z => z.classList.add('target'));
    }
  }

  function targetAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    if (!hit) return null;
    if (drag.kind === 'doc') return hit.closest('.row');
    const z = hit.closest('.zone');
    if (z && z.dataset.type === drag.type) return z;
    return hit.closest('#pool');
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dist = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
    if (!drag.active) {
      if (drag.touch && !drag.ready && dist > 8) { clearTimeout(drag.timer); drag = null; return; }
      if (drag.ready && dist > 6) startDrag(e); else return;
    }
    e.preventDefault();
    drag.ghost.style.left = (e.clientX - drag.offX) + 'px';
    drag.ghost.style.top = (e.clientY - drag.offY) + 'px';
    const t = targetAt(e.clientX, e.clientY);
    if (t !== drag.over) {
      if (drag.over) drag.over.classList.remove('drop-hover');
      if (t) t.classList.add('drop-hover');
      drag.over = t;
    }
    // automatisch scrollen bij de rand
    const edge = 60;
    if (e.clientY < edge + 60) window.scrollBy(0, -12);
    else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 12);
  }

  function endDrag(e, cancelled) {
    if (!drag) return;
    clearTimeout(drag.timer);
    const d = drag;
    drag = null;
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 50);
    d.ghost.remove();
    d.src.classList.remove('dragging-src');
    document.body.classList.remove('dragging');
    if (d.over) d.over.classList.remove('drop-hover');
    if (cancelled || !d.over) { render(); return; }
    const t = d.over;
    if (d.kind === 'doc') {
      moveDoc(d.doc, +t.dataset.index);
    } else if (t.classList.contains('zone')) {
      placeCard(d.card, d.type, t.dataset.doc);
    } else {
      const from = whereIs(d.card, d.type);
      if (from) removeCard(from, d.type); else render();
    }
  }

  /* ---------- opstart ---------- */
  function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', e => endDrag(e, false));
    document.addEventListener('pointercancel', e => endDrag(e, true));
    document.addEventListener('touchmove', e => { if (drag && (drag.active || drag.ready)) e.preventDefault(); }, { passive: false });
    document.addEventListener('dragstart', e => { if (e.target.closest && e.target.closest('[data-drag]')) e.preventDefault(); });

    $('startForm').addEventListener('submit', e => {
      e.preventDefault();
      const naam = $('naam').value.trim().replace(/\s+/g, ' ');
      const pin = $('pin').value.trim();
      const err = msg => { $('startError').textContent = msg; $('startError').hidden = false; };
      if (!naam) return err('Vul je voor- en achternaam in.');
      if (ONLINE && !/^\d{4}$/.test(pin)) return err('Kies een pincode van 4 cijfers.');
      $('startError').hidden = true;
      const old = load();
      const sameName = old && (old.naam || '').toLowerCase() === naam.toLowerCase();
      const begin = state => {
        if (old && !sameName) archive(old);
        S = state || newSession(naam);
        if (ONLINE) S.pin = pin;
        tab = 'naam';
        save();
        if (ONLINE) syncNow();
        if (S.done) showResult(); else startWork();
      };

      if (!ONLINE) {
        const go = () => { archive(old); S = newSession(naam); tab = 'naam'; save(); startWork(); };
        if (old && !old.done && old.attempts.length) {
          confirmBox('Opnieuw beginnen?',
            `Er is al een oefening bezig van ${old.naam} met ${old.attempts.length} controle(s). Wil je die wissen en opnieuw beginnen? Je leerkracht ziet dat er herbegonnen werd.`,
            'Ja, opnieuw beginnen', go);
        } else go();
        return;
      }

      const btn = $('startBtn');
      btn.disabled = true;
      btn.textContent = 'Even geduld…';
      api({ action: 'start', naam, pin }).then(res => {
        btn.disabled = false;
        btn.textContent = 'Start de oefening';
        if (!res || !res.ok) return err((res && res.error) || 'Er ging iets mis. Probeer opnieuw.');
        if (res.status === 'resume' && res.state) {
          // Nieuwste versie nemen: die van de sheet of die op deze computer
          const local = sameName && old.pin === pin ? old : null;
          const useLocal = local && (local.updated || 0) > (res.state.updated || 0);
          begin(useLocal ? local : res.state);
          if (!useLocal) pending = false;
          toast('Welkom terug! Je kan verder werken.');
        } else {
          begin(null);
        }
      }).catch(() => {
        btn.disabled = false;
        btn.textContent = 'Start de oefening';
        if (sameName && old.pin === pin) { begin(old); }
        else { begin(null); }
        setSync('err', '⚠ Geen verbinding, je werk staat op deze computer');
      });
    });
    $('resumeBtn').addEventListener('click', () => {
      S = load();
      if (!S) return showStart();
      startWork();
    });
    $('checkBtn').addEventListener('click', check);
    $('handInBtn').addEventListener('click', handIn);
    $('poolToggle').addEventListener('click', e => { e.stopPropagation(); poolCollapsed = !poolCollapsed; renderPool(); });
    $('docModalClose').addEventListener('click', () => { $('docModal').hidden = true; });
    $('docModal').addEventListener('click', e => { if (e.target === $('docModal')) $('docModal').hidden = true; });
    $('confirmNo').addEventListener('click', () => { $('confirmModal').hidden = true; confirmCb = null; });
    $('confirmYes').addEventListener('click', () => {
      $('confirmModal').hidden = true;
      const cb = confirmCb;
      confirmCb = null;
      if (cb) cb();
    });

    $('pinField').hidden = !ONLINE;
    $('pinHelp').hidden = !ONLINE;
    document.querySelector('#startForm .fields').classList.toggle('single', !ONLINE);
    const saved = load();
    if (saved && saved.done) { S = saved; showResult(); }
    else showStart();
  }

  init();
})();
