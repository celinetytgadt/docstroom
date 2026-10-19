/* Documentenstroom – leerkrachtoverzicht */
(function () {
  'use strict';

  const DS = window.DS;
  const { IDS, NAME, TYPES, TOTAL } = DS;
  const KEY = 'ds-teacher-v1';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLS = [{ id: 'pos', label: 'Volgorde' }].concat(TYPES.map(t => ({ id: t.id, label: t.short })));

  let codes = [];          // handmatig ingeplakte codes (uniek)
  let server = [];         // rijen uit de Google Sheet
  let rows = [];           // {code, s, an, v, meta}
  let active = null;
  let activeName = null;
  let pw = '';
  const URL_ = (window.DS_CONFIG && window.DS_CONFIG.scriptUrl || '').trim();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(codes)); } catch (e) { /* negeren */ }
  }

  function fmtDate(ts) {
    if (!ts) return '–';
    const d = new Date(ts);
    return d.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' }) + ' ' +
           d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDur(s) {
    if (!s.end || !s.start) return '–';
    const m = Math.round((s.end - s.start) / 60000);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} u ${m % 60}`;
  }

  function addCodes(text) {
    const found = String(text).match(/DS1\.[A-Za-z0-9_\-]+\.[a-z0-9]+/g) || [];
    const errs = [];
    let added = 0;
    found.forEach(c => {
      try {
        DS.decodeResult(c);
        if (!codes.includes(c)) { codes.push(c); added++; }
      } catch (e) { errs.push(e.message); }
    });
    if (!found.length && String(text).trim()) errs.push('Geen geldige resultaatcode gevonden. Een code begint met “DS1.”.');
    showErrors(errs);
    persist();
    build();
    return added;
  }

  function showErrors(errs) {
    const ul = $('errors');
    ul.innerHTML = errs.map(e => `<li>${esc(e)}</li>`).join('');
    ul.hidden = !errs.length;
  }

  function build() {
    const entries = server.map(r => ({ code: r.code, meta: r }))
      .concat(codes.map(c => ({ code: c, meta: null })));
    const all = entries.map(({ code, meta }) => {
      let s = null;
      try { s = code ? DS.decodeResult(code) : null; } catch (e) { s = null; }
      if (!s) s = { naam: meta ? meta.naam : '?', attempts: [], start: null, end: null, done: false, intact: true, restarts: 0 };
      if (meta) s.naam = meta.naam;
      const an = DS.analyse(s);
      return { code, s, an, v: DS.verdict(an), meta };
    });
    // Per leerling één rij: de sheet gaat voor, anders de nieuwste inzending
    const byKey = new Map();
    const count = new Map();
    all.forEach(r => {
      const k = (r.s.naam || '').toLowerCase();
      count.set(k, (count.get(k) || 0) + 1);
      const prev = byKey.get(k);
      if (!prev || (r.meta && !prev.meta) || (!!r.meta === !!prev.meta && (r.s.start || 0) > (prev.s.start || 0))) byKey.set(k, r);
    });
    rows = [...byKey.values()].map(r => { r.dups = count.get((r.s.naam || '').toLowerCase()) - 1; return r; });
    rows.sort((a, b) => (a.s.naam || '').localeCompare(b.s.naam || ''));
    active = activeName === null ? null : rows.findIndex(r => r.s.naam.toLowerCase() === activeName);
    if (active === -1) { active = null; activeName = null; }
    renderOverview();
    renderClass();
    renderDetail();
    $('csvBtn').disabled = !rows.length;
  }

  function renderOverview() {
    $('overviewPanel').hidden = !rows.length;
    if (!rows.length) return;
    $('overview').innerHTML = `
      <thead><tr><th>Leerling</th><th class="c">Controles</th><th class="c">1e controle</th><th class="c">Einde</th><th>Status</th><th>Inschatting</th><th>Tijd</th><th>Opmerking</th></tr></thead>
      <tbody>${rows.map((r, i) => {
        const notes = [];
        if (!r.s.intact) notes.push('<span class="warnflag">⚠ code gewijzigd</span>');
        if (r.s.restarts) notes.push(`<span class="warnflag">${r.s.restarts}× herbegonnen</span>`);
        if (r.dups) notes.push(`${r.dups} extra inzending${r.dups > 1 ? 'en' : ''}`);
        if (r.an.flips) notes.push(`${r.an.flips}× juist → fout`);
        return `<tr class="clickable${active === i ? ' active' : ''}" data-i="${i}" tabindex="0">
          <td><b>${esc(r.s.naam)}</b></td>
          <td class="c">${r.an.n}</td>
          <td class="c">${r.an.first}/${TOTAL}</td>
          <td class="c">${r.an.last}/${TOTAL}</td>
          <td>${statusPill(r)}</td>
          <td><span class="pill ${r.v.level}">${r.v.label}</span></td>
          <td>${status(r) === 'bezig' ? (r.meta && r.meta.updated ? 'actief ' + fmtDate(r.meta.updated).split(' ')[1] : '–') : fmtDur(r.s)}</td>
          <td>${notes.join(' · ')}</td></tr>`;
      }).join('')}</tbody>`;
  }

  function status(r) {
    if (r.meta && r.meta.status) return r.meta.status;
    return r.s.done ? 'alles juist' : 'ingeleverd';
  }
  function statusPill(r) {
    const st = status(r);
    const cls = st === 'alles juist' ? 'good' : st === 'ingeleverd' ? 'warn' : 'none';
    return `<span class="pill ${cls} status-pill">${esc(st)}</span>`;
  }

  function cell(x) {
    if (x.solvedAt === null) return '<span class="pill bad">✗</span>';
    const cls = x.solvedAt === 1 ? 'good' : x.solvedAt === 2 ? 'warn' : 'bad';
    const flip = x.flips ? ` title="${x.flips}× van juist naar fout"` : '';
    return `<span class="pill ${cls}"${flip}>${x.solvedAt}${x.flips ? '↺' : ''}</span>`;
  }

  function renderDetail() {
    const p = $('detailPanel');
    if (active === null) { p.hidden = true; return; }
    const r = rows[active];
    const an = r.an;
    p.hidden = false;
    p.innerHTML = `
      <div class="detail-head">
        <h2>${esc(r.s.naam)}</h2>
        <span class="muted">${statusPill(r)} · gestart ${fmtDate(r.s.start)}${r.s.end ? ` · klaar ${fmtDate(r.s.end)} · ${fmtDur(r.s)}` : ''}${r.meta ? ` · pincode ${esc(r.meta.pin)}` : ''}</span>
      </div>
      <div class="kpis">
        <div class="kpi"><b>${an.n}</b><span>controles</span></div>
        <div class="kpi"><b>${an.first}/${TOTAL}</b><span>juist bij 1e controle</span></div>
        <div class="kpi"><b>${an.last}/${TOTAL}</b><span>juist op het einde</span></div>
        <div class="kpi"><b>${an.flips}</b><span>keer juist → fout</span></div>
      </div>
      <div class="matrix-wrap"><table class="matrix">
        <thead><tr><th>Document</th>${COLS.map(c => `<th class="c">${c.label}</th>`).join('')}</tr></thead>
        <tbody>${IDS.map((id, i) => `<tr><td>${i + 1}. ${NAME[id]}</td>${COLS.map(c => `<td class="c">${cell(an.items[id][c.id])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="legend"><span>Getal = vanaf welke controle het juist bleef:</span>
        <span class="pill good">1</span> meteen <span class="pill warn">2</span> <span class="pill bad">3+</span> <span class="pill bad">✗</span> nooit juist · ↺ = was al eens juist en werd daarna weer fout</div>
      <h3>Verbetering per controle</h3>
      <p class="muted">Aantal juiste antwoorden per soort kaartje bij elke controle (+/− = verschil met de vorige controle).</p>
      ${an.n ? DS.progressHtml(an) : '<p>Nog geen controle gedaan.</p>'}
      <h3>Fouten per controle</h3>
      <div class="attempts">${an.evals.map((e, i) => `
        <div class="attempt">
          <h3>Controle ${i + 1} <span class="pill ${e.ev.score === TOTAL ? 'good' : 'none'}">${e.ev.score}/${TOTAL}</span>
            <span class="muted">${fmtDate(r.s.attempts[i].t)}</span></h3>
          ${e.errors.length ? `<ul>${e.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<div class="none">Geen fouten.</div>'}
        </div>`).join('') || '<p>Nog geen controle gedaan.</p>'}
      </div>
      ${r.meta ? `<div class="input-row"><button class="btn ghost" type="button" id="deleteBtn">Leerling wissen (laten herbeginnen)</button>
        <span class="muted">Wist de rij in de sheet. De leerling kan dan opnieuw starten met dezelfde naam.</span></div>` : ''}`;
    const del = $('deleteBtn');
    if (del) {
      let armed = false;
      del.onclick = () => {
        if (!armed) { armed = true; del.textContent = `Zeker? Klik nogmaals om ${r.s.naam} te wissen`; setTimeout(() => { armed = false; del.textContent = 'Leerling wissen (laten herbeginnen)'; }, 4000); return; }
        del.disabled = true;
        api({ action: 'delete', wachtwoord: pw, naam: r.meta.naam }).then(res => {
          if (!res.ok) throw new Error(res.error);
          activeName = null;
          return fetchServer();
        }).catch(e => { del.disabled = false; liveError(e.message || 'Wissen mislukt.'); });
      };
    }
  }

  /* ---------- Google Sheet ---------- */
  function api(body) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' }).then(r => r.json());
  }
  function liveError(msg) {
    $('liveError').textContent = msg || '';
    $('liveError').hidden = !msg;
  }
  function fetchServer() {
    if (!URL_ || !pw) return Promise.resolve();
    $('liveStatus').textContent = 'Ophalen…';
    return api({ action: 'list', wachtwoord: pw }).then(res => {
      if (!res.ok) {
        server = [];
        build();
        $('liveStatus').textContent = '';
        $('refreshBtn').hidden = true;
        liveError(res.error || 'Ophalen mislukt.');
        return;
      }
      liveError('');
      try { sessionStorage.setItem('ds-teacher-pw', pw); } catch (e) { /* negeren */ }
      server = res.rows || [];
      build();
      $('refreshBtn').hidden = false;
      $('liveStatus').textContent = `${server.length} leerling${server.length === 1 ? '' : 'en'} · bijgewerkt ${new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    }).catch(() => {
      $('liveStatus').textContent = '';
      liveError('Geen verbinding met de Google Sheet. Klopt de scriptUrl in js/config.js?');
    });
  }

  function renderClass() {
    $('classPanel').hidden = !rows.length;
    if (!rows.length) return;
    const n = rows.filter(r => r.an.n).length || 1;
    const pct = (id, key) => Math.round(100 * rows.filter(r => r.an.n && r.an.items[id][key].first).length / n);
    const lvl = v => v >= 80 ? 'good' : v >= 60 ? 'ok' : v >= 40 ? 'warn' : 'bad';
    $('classTable').innerHTML = `
      <thead><tr><th>Document</th>${COLS.map(c => `<th class="c">${c.label}</th>`).join('')}</tr></thead>
      <tbody>${IDS.map((id, i) => `<tr><td>${i + 1}. ${NAME[id]}</td>${COLS.map(c => {
        const v = pct(id, c.id);
        return `<td class="c"><span class="pill ${lvl(v)}">${v}%</span></td>`;
      }).join('')}</tr>`).join('')}</tbody>`;
  }

  function csv() {
    const head = ['Naam', 'Controles', 'Juist 1e controle', 'Juist einde', 'Totaal', 'Status', 'Inschatting', 'Juist→fout', 'Herbegonnen', 'Code intact', 'Start', 'Einde']
      .concat(IDS.flatMap(id => COLS.map(c => `${NAME[id]} – ${c.label}`)));
    const lines = [head];
    rows.forEach(r => {
      lines.push([
        r.s.naam, r.an.n, r.an.first, r.an.last, TOTAL, status(r), r.v.label,
        r.an.flips, r.s.restarts || 0, r.s.intact ? 'ja' : 'NEE', fmtDate(r.s.start), fmtDate(r.s.end)
      ].concat(IDS.flatMap(id => COLS.map(c => {
        const x = r.an.items[id][c.id];
        return x.solvedAt === null ? 'nooit' : x.solvedAt;
      }))));
    });
    const text = lines.map(l => l.map(v => {
      const s = String(v);
      return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'documentenstroom_resultaten.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function init() {
    $('solution').innerHTML = IDS.map(id => `<li>${NAME[id]}</li>`).join('');
    try { codes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { codes = []; }
    build();

    $('readBtn').addEventListener('click', () => {
      const n = addCodes($('codes').value);
      if (n || !$('errors').innerHTML) $('codes').value = '';
    });
    if (!URL_) {
      $('liveIntro').textContent = 'De koppeling met de Google Sheet is nog niet ingesteld (scriptUrl in js/config.js is leeg). Je kan intussen codes handmatig inlezen.';
      $('loginForm').hidden = true;
      $('manualBox').open = true;
    } else {
      try { pw = sessionStorage.getItem('ds-teacher-pw') || ''; } catch (e) { pw = ''; }
      if (pw) { $('pw').value = pw; fetchServer(); }
    }
    $('loginForm').addEventListener('submit', e => { e.preventDefault(); pw = $('pw').value; fetchServer(); });
    $('refreshBtn').addEventListener('click', fetchServer);
    $('csvBtn').addEventListener('click', csv);
    let armed = false;
    $('clearBtn').addEventListener('click', e => {
      if (!armed) {
        armed = true;
        e.target.textContent = 'Klik nogmaals om te wissen';
        setTimeout(() => { armed = false; e.target.textContent = 'Ingeplakte codes wissen'; }, 3000);
        return;
      }
      codes = []; activeName = null; persist(); build(); showErrors([]);
      e.target.textContent = 'Ingeplakte codes wissen'; armed = false;
    });
    const pick = tr => { active = +tr.dataset.i; activeName = rows[active].s.naam.toLowerCase(); renderOverview(); renderDetail(); $('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    $('overview').addEventListener('click', e => { const tr = e.target.closest('tr[data-i]'); if (tr) pick(tr); });
    $('overview').addEventListener('keydown', e => { const tr = e.target.closest('tr[data-i]'); if (tr && e.key === 'Enter') pick(tr); });
  }

  init();
})();
