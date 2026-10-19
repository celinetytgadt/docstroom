/* Documentenstroom – gedeelde logica (controle, resultaatcode, analyse)
 * Gebruikt door de leerlingenapp (index.html) en het leerkrachtoverzicht (leerkracht.html).
 */
(function () {
  'use strict';

  const { DOCS, TYPES } = window.DS_DATA;
  const IDS = DOCS.map(d => d.id);
  const NAME = Object.fromEntries(DOCS.map(d => [d.id, d.naam]));
  const TYPE_LABEL = Object.fromEntries(TYPES.map(t => [t.id, t.label]));
  const TOTAL = DOCS.length * (1 + TYPES.length);
  const PREFIX = 'DS1.';
  const SALT = 'documentenstroom-de-met';

  /* ---------- controle ---------- */

  // order: array van doc-ids per plaats; attach: {docId: {type: kaartDocId|null}}
  function evaluate(order, attach) {
    const pos = {};
    const card = {};
    const byType = { pos: 0 };
    TYPES.forEach(t => { byType[t.id] = 0; });
    let score = 0;
    order.forEach((id, i) => {
      pos[id] = IDS[i] === id;
      if (pos[id]) { score++; byType.pos++; }
    });
    IDS.forEach(id => {
      card[id] = {};
      TYPES.forEach(t => {
        const ok = attach[id] && attach[id][t.id] === id;
        card[id][t.id] = !!ok;
        if (ok) { score++; byType[t.id]++; }
      });
    });
    return { pos, card, byType, score, total: TOTAL };
  }

  function describeErrors(order, attach) {
    const out = [];
    order.forEach((id, i) => {
      const juist = IDS.indexOf(id);
      if (juist !== i) out.push(`Volgorde: ${NAME[id]} lag op plaats ${i + 1} (juist: plaats ${juist + 1})`);
    });
    IDS.forEach(id => {
      TYPES.forEach(t => {
        const c = attach[id] && attach[id][t.id];
        if (c && c !== id) out.push(`${TYPE_LABEL[t.id]}: kaartje van ${NAME[c]} lag bij ${NAME[id]}`);
        else if (!c) out.push(`${TYPE_LABEL[t.id]}: geen kaartje bij ${NAME[id]}`);
      });
    });
    return out;
  }

  /* ---------- compacte opslag van een poging ---------- */

  function packAttempt(order, attach) {
    const o = order.map(id => IDS.indexOf(id)).join('');
    let a = '';
    IDS.forEach(id => TYPES.forEach(t => {
      const c = attach[id] && attach[id][t.id];
      a += c ? String(IDS.indexOf(c)) : '-';
    }));
    return o + ':' + a;
  }

  function unpackAttempt(s) {
    const [o, a] = s.split(':');
    const order = o.split('').map(n => IDS[+n]);
    const attach = {};
    let k = 0;
    IDS.forEach(id => {
      attach[id] = {};
      TYPES.forEach(t => {
        const ch = a[k++];
        attach[id][t.id] = ch === '-' || ch === undefined ? null : IDS[+ch];
      });
    });
    return { order, attach };
  }

  /* ---------- resultaatcode ---------- */

  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64decode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // session: {naam, klas, start, end, done, attempts:[{t, p}]}
  function encodeResult(session) {
    const payload = {
      v: 1,
      n: session.naam,
      k: session.klas,
      s: session.start,
      e: session.end || null,
      d: session.done ? 1 : 0,
      r: session.restarts || 0,
      a: session.attempts.map(x => [x.t, x.p])
    };
    const json = JSON.stringify(payload);
    return PREFIX + b64encode(json) + '.' + hash(SALT + json);
  }

  function decodeResult(code) {
    code = String(code).trim().replace(/\s+/g, '');
    if (!code.startsWith(PREFIX)) throw new Error('Dit is geen resultaatcode van Documentenstroom.');
    const body = code.slice(PREFIX.length);
    const dot = body.lastIndexOf('.');
    if (dot < 0) throw new Error('De code is onvolledig.');
    let json;
    try { json = b64decode(body.slice(0, dot)); } catch (e) { throw new Error('De code is beschadigd of onvolledig gekopieerd.'); }
    let p;
    try { p = JSON.parse(json); } catch (e) { throw new Error('De code is beschadigd of onvolledig gekopieerd.'); }
    return {
      naam: p.n,
      klas: p.k,
      start: p.s,
      end: p.e,
      done: !!p.d,
      restarts: p.r || 0,
      attempts: (p.a || []).map(([t, s]) => ({ t, p: s })),
      intact: hash(SALT + json) === body.slice(dot + 1)
    };
  }

  /* ---------- analyse voor de leerkracht ---------- */

  // Per onderdeel (volgorde + 4 kaartjes per document): bij welke poging werd het
  // juist en bleef het juist? En hoe vaak sprong het van juist naar fout?
  function analyse(session) {
    const evals = session.attempts.map(a => {
      const { order, attach } = unpackAttempt(a.p);
      return { order, attach, ev: evaluate(order, attach), errors: describeErrors(order, attach) };
    });
    const items = {};
    IDS.forEach(id => {
      items[id] = {};
      ['pos'].concat(TYPES.map(t => t.id)).forEach(key => {
        const seq = evals.map(e => key === 'pos' ? e.ev.pos[id] : e.ev.card[id][key]);
        let solvedAt = null;
        for (let i = seq.length - 1; i >= 0; i--) {
          if (seq[i]) solvedAt = i + 1; else break;
        }
        let flips = 0;
        for (let i = 1; i < seq.length; i++) if (seq[i - 1] && !seq[i]) flips++;
        items[id][key] = { solvedAt, flips, first: seq.length ? seq[0] : false };
      });
    });
    const first = evals.length ? evals[0].ev.score : 0;
    const last = evals.length ? evals[evals.length - 1].ev.score : 0;
    let flips = 0;
    IDS.forEach(id => Object.values(items[id]).forEach(x => { flips += x.flips; }));
    return { evals, items, first, last, total: TOTAL, flips, n: evals.length };
  }

  function verdict(an) {
    if (!an.n) return { label: 'Geen poging', level: 'none' };
    const pct = an.first / an.total;
    if (pct >= 0.9 && an.flips <= 1) return { label: 'Kent het', level: 'good' };
    if (pct >= 0.7 && an.n <= 4) return { label: 'Kent het grotendeels', level: 'ok' };
    if (an.n >= 6 || an.flips >= 4 || pct < 0.5) return { label: 'Waarschijnlijk gegokt', level: 'bad' };
    return { label: 'Twijfelt', level: 'warn' };
  }

  /* ---------- verbetering per controle ---------- */

  // Tabel: per controle het aantal juiste antwoorden per soort kaartje (en volgorde),
  // met het verschil tegenover de vorige controle.
  function progressHtml(an) {
    if (!an.n) return '';
    const cols = [{ id: 'pos', label: 'Volgorde' }].concat(TYPES.map(t => ({ id: t.id, label: t.label })));
    const per = DOCS.length;
    const lvl = (v, max) => v === max ? 'good' : v >= 0.75 * max ? 'ok' : v >= 0.5 * max ? 'warn' : 'bad';
    const diff = d => d ? `<small class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</small>` : '';
    return `<div class="matrix-wrap"><table class="matrix rounds">
      <thead><tr><th>Controle</th>${cols.map(c => `<th class="c">${c.label}</th>`).join('')}<th class="c">Totaal</th></tr></thead>
      <tbody>${an.evals.map((e, i) => {
        const prev = i ? an.evals[i - 1].ev : null;
        return `<tr><td>${i + 1}</td>${cols.map(c => {
          const v = e.ev.byType[c.id];
          return `<td class="c"><span class="pill ${lvl(v, per)}">${v}/${per}</span>${prev ? diff(v - prev.byType[c.id]) : ''}</td>`;
        }).join('')}<td class="c"><b>${e.ev.score}/${TOTAL}</b>${prev ? diff(e.ev.score - prev.score) : ''}</td></tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }

  window.DS = {
    DOCS, TYPES, IDS, NAME, TYPE_LABEL, TOTAL,
    evaluate, describeErrors, packAttempt, unpackAttempt,
    encodeResult, decodeResult, analyse, verdict, progressHtml
  };
})();
