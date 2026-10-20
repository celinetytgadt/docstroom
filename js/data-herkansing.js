/* Documentenstroom – gegevens voor de HERKANSING
 * Een andere bestelling (40 fietshelmen tussen Trapkracht en Velomondo) met dezelfde
 * acht soorten documenten. De kaartjes zeggen hetzelfde als in de oefening, maar in
 * andere woorden: wie de vorige poging heeft overgenomen, heeft daar niets aan.
 * De ids en de volgorde van DOCS zijn gelijk aan js/data.js, zodat de analyse en
 * het leerkrachtoverzicht ongewijzigd werken. De volgorde van DOCS is de oplossing.
 */
(function () {
  'use strict';

  const BLANK = '<span class="blank">…………………</span>';

  const LOGO = `<svg class="logo" viewBox="0 0 120 60" role="img" aria-label="Logo Velomondo">
      <circle cx="22" cy="30" r="17" fill="none" stroke="#1f6f5c" stroke-width="4"/>
      <circle cx="22" cy="30" r="3" fill="#1f6f5c"/>
      <path d="M22 13v34M5 30h34M10 18l24 24M34 18L10 42" stroke="#1f6f5c" stroke-width="1.2"/>
      <text x="44" y="29" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#1f6f5c">velo</text>
      <text x="44" y="45" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#e07a2e">mondo</text>
    </svg>`;
  const SIG_AMIRA = `<svg class="sig" viewBox="0 0 160 52" role="img" aria-label="Handtekening Amira El Idrissi">
      <path d="M8 40c10-24 18-34 22-30s-8 26-4 28 12-20 18-18-2 16 4 16 10-14 16-12-4 10 2 10 14-18 22-16-6 18 2 16 20-14 30-12 14 2 30-4" fill="none" stroke="#1c2b6b" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
  const SIG_LUCAS = `<svg class="sig" viewBox="0 0 160 52" role="img" aria-label="Handtekening Lucas Janssens">
      <path d="M10 12c2 14 0 26-2 30 8-2 16-4 22-2M40 24c-6 8-4 16 2 14s8-14 6-16M56 22c-2 10 0 18 6 16s6-12 4-16m6 2c4 10 10 14 16 8s0-16 8-14 4 12 12 10 12-10 22-12 14 4 22 0" fill="none" stroke="#123" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;

  const KLANT = `
    <div class="addr">Trapkracht<br>Naamsestraat 120<br>3000&nbsp;&nbsp;&nbsp;LEUVEN<br>BE 0654 321 987<br>Klantnr. 50112</div>`;
  const LEVERANCIER = `
    <div class="addr right">Industrieweg 14<br>9032 WONDELGEM<br>BE 0478 512 336</div>`;
  const FOOTER = `
    <footer class="doc-foot">
      <div class="foot-top"><span>Velomondo bv</span><span>Tel. 09 216 40 40</span><span>www.velomondo.be</span></div>
      <div class="foot-grid">
        <span>Ondernemingsnummer: 0478 512 336</span><span class="r">RPR Gent</span>
        <span>Belfius: BE62 0689 0412 3361</span><span class="r">GKCCBEBB</span>
      </div>
    </footer>`;

  function head(nummer, sub) {
    return `
      <div class="doc-head">
        <div class="doc-title">${BLANK}<span class="fill">${nummer}</span>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
        ${LOGO}
      </div>
      <div class="addr-row">${KLANT}${LEVERANCIER}</div>`;
  }

  const ART = 'Stadshelm Urban, mat zwart, maat M';

  const DOCS = [
    {
      id: 'pa',
      naam: 'Prijsaanvraag',
      html: `
        <div class="letter">
          <div class="letter-meta">
            <div><b>Trapkracht</b> – fietsen &amp; accessoires</div>
            <div>Naamsestraat 120, 3000 Leuven · lucas@trapkracht.be</div>
          </div>
          <div class="addr-row"><div></div><div class="addr right">Velomondo bv<br>t.a.v. de verkoopdienst<br>Industrieweg 14<br>9032 Wondelgem</div></div>
          <p>Leuven, 3 maart 20..</p>
          <p><b>Betreft:</b> ${BLANK} fietshelmen</p>
          <p>Geachte mevrouw, geachte heer,</p>
          <p>Voor het voorjaar willen wij ons aanbod fietshelmen uitbreiden. Wij denken aan ongeveer 40 stadshelmen <i>Urban</i>, mat zwart, maat M.</p>
          <p>Kan u ons laten weten:</p>
          <ul>
            <li>wat één helm kost bij een afname van 40 stuks;</li>
            <li>of u een korting geeft bij die hoeveelheid;</li>
            <li>hoe snel u kan leveren;</li>
            <li>of er verzendkosten aangerekend worden.</li>
          </ul>
          <p>Wij ontvangen uw antwoord graag vóór 7 maart.</p>
          <p>Met vriendelijke groeten,</p>
          <p>Lucas Janssens<br>Zaakvoerder Trapkracht</p>
        </div>`,
      wat: `<p>Hiermee wil een onderneming <strong>iets te weten komen voor ze iets koopt</strong>: hoeveel kost het, en onder welke voorwaarden?</p>
            <p>Er wordt nog <em>niets gekocht</em>. Het is een vraag, geen opdracht.</p>`,
      wie: `<p>De <strong>koper</strong> stuurt het: de zaakvoerder of de aankoopdienst.</p>
            <p>Het gaat naar één of meer <strong>mogelijke leveranciers</strong>. Die moeten dan nog antwoorden.</p>`,
      inhoud: `<ul class="steps"><li>🛒 Welk product en ongeveer hoeveel</li><li>❓ Vragen over prijs, korting, levertijd en verzending</li><li>📬 Gegevens van de koper om op te antwoorden</li><li>🚫 Nog geen prijzen of bedragen</li></ul>`
    },
    {
      id: 'po',
      naam: 'Offerte (prijsofferte)',
      html: `
        ${head('nr. 26-118')}
        <div class="meta-list">
          <div><span>Datum:</span><span class="fill">20..-03-05</span></div>
          <div><span>Geldig tot:</span><span class="fill">20..-03-31</span></div>
        </div>
        <p>Geachte heer Janssens</p>
        <p>Bedankt voor uw brief van 3 maart. Hieronder vindt u ons voorstel.</p>
        <table class="t">
          <thead><tr><th>Art.<br>nr.</th><th>Omschrijving</th><th>Aantal</th><th>Prijs/stuk<br>(excl. btw)</th><th>Bedrag<br>(excl. btw)</th></tr></thead>
          <tbody>
            <tr><td>HU-M</td><td>${ART}</td><td class="n">40</td><td class="n">45,00</td><td class="n">1 800,00</td></tr>
            <tr><td></td><td>Korting vanaf 40 stuks: € 5,00 per stuk</td><td class="n">40</td><td class="n">−5,00</td><td class="n">−200,00</td></tr>
            <tr><td></td><td><b>Totaal excl. btw</b></td><td></td><td></td><td class="n"><b>1 600,00</b></td></tr>
            <tr><td></td><td>Btw 21 %</td><td></td><td></td><td class="n">336,00</td></tr>
            <tr><td></td><td><b>Totaal incl. btw</b></td><td></td><td></td><td class="n"><b>1 936,00</b></td></tr>
          </tbody>
        </table>
        <div class="meta-list">
          <div><span>Levertermijn:</span><span class="fill">3 werkdagen na ontvangst van uw bestelling</span></div>
          <div><span>Verzending:</span><span class="fill">gratis vanaf € 500 (excl. btw)</span></div>
          <div><span>Betaling:</span><span class="fill">30 dagen na factuurdatum</span></div>
        </div>
        <p>Gaat u akkoord? Dan verwerken wij uw bestelling graag.</p>
        ${SIG_AMIRA}
        <p>Amira El Idrissi<br>Verkoopdienst</p>
        ${FOOTER}`,
      wat: `<p>Een <strong>voorstel</strong> met een prijs en de voorwaarden erbij.</p>
            <p>De klant is nog <strong>vrij om te kiezen</strong>: hij kan het voorstel aannemen, weigeren of vergelijken met dat van andere leveranciers.</p>`,
      wie: `<p>De <strong>verkoopdienst van de leverancier</strong> maakt het op.</p>
            <p>Het gaat naar de klant die eerder <strong>vroeg wat iets zou kosten</strong>.</p>`,
      inhoud: `<ul class="steps"><li>💶 Prijs per stuk, korting en totaal</li><li>🚚 Levertermijn en verzendkosten</li><li>⏳ Datum tot wanneer het voorstel geldt</li><li>✉️ Antwoord op een vraag van de klant</li></ul>`
    },
    {
      id: 'bb',
      naam: 'Bestelbon',
      html: `
        <div class="doc-head">
          <div class="doc-title">${BLANK}<span class="fill">nr. 20../031</span><div class="sub">Trapkracht · Naamsestraat 120 · 3000 Leuven</div></div>
        </div>
        <div class="addr-row"><div></div><div class="addr right">Aan: Velomondo bv<br>Industrieweg 14<br>9032 WONDELGEM</div></div>
        <div class="meta-list">
          <div><span>Datum:</span><span class="fill">20..-03-10</span></div>
          <div><span>Uw voorstel:</span><span class="fill">nr. 26-118 van 20..-03-05</span></div>
          <div><span>Gewenste leverdatum:</span><span class="fill">20..-03-14</span></div>
          <div><span>Leveringsadres:</span><span class="fill">winkel, Naamsestraat 120, Leuven</span></div>
        </div>
        <table class="t">
          <thead><tr><th>Art.<br>nr.</th><th>Omschrijving</th><th>Aantal</th><th>Eenheidspr.<br>(excl. btw)</th><th>Bedrag<br>(excl. btw)</th></tr></thead>
          <tbody>
            <tr><td>HU-M</td><td>${ART}</td><td class="n fill">40</td><td class="n fill">40,00</td><td class="n fill">1 600,00</td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div class="total"><b>Totaal goederen:</b> <span class="fill">1 600,00</span></div>
        <div class="sign-solo">
          ${SIG_LUCAS}
          <div class="sign-lbl"><span>Handtekening koper</span><span class="fill">Lucas Janssens<br>Zaakvoerder Trapkracht</span></div>
        </div>`,
      wat: `<p>Hiermee zegt de klant: <strong>“Ik koop het.”</strong></p>
            <p>Het is de <strong>opdracht om te leveren</strong>: dit product, zoveel stuks, tegen de prijs die afgesproken werd.</p>`,
      wie: `<p>De <strong>aankoopdienst van de klant</strong> (of de zaakvoerder) maakt het op en ondertekent het.</p>
            <p>Het gaat naar de <strong>leverancier</strong>, nadat de klant het voorstel aanvaard heeft.</p>`,
      inhoud: `<ul class="steps"><li>🔢 Eigen nummer van de klant</li><li>🔗 Verwijzing naar het voorstel van de leverancier</li><li>📦 Wat, hoeveel en tegen welke prijs</li><li>📅 Gewenste leverdatum en leveringsadres</li><li>✍️ Handtekening van de koper</li></ul>`
    },
    {
      id: 'ob',
      naam: 'Orderbevestiging',
      html: `
        <div class="mail">
          <div class="mail-head">
            <div><b>Van:</b> <u>amira.elidrissi@velomondo.be</u></div>
            <div><b>Aan:</b> <u>lucas@trapkracht.be</u></div>
            <div><b>Datum:</b> 11 maart 20..</div>
            <div><b>Onderwerp:</b> ${BLANK} – uw bestelling nr. 20../031</div>
          </div>
          <p>Beste Lucas</p>
          <p>Bedankt voor uw bestelling van 10 maart. Wij hebben ze goed ontvangen en aanvaard onder ons ordernummer <b>V2040</b>. Vermeld dit nummer altijd als u ons contacteert.</p>
          <table class="t">
            <thead><tr><th>Art. nr.</th><th>Omschrijving</th><th>Aantal</th><th>Prijs</th><th>Bedrag (in EUR)</th></tr></thead>
            <tbody><tr><td>HU-M</td><td>${ART}</td><td class="n">40</td><td class="n">40,00</td><td class="n">1 600,00</td></tr></tbody>
          </table>
          <ul>
            <li><b>Voorziene levering:</b> 14 maart, met onze eigen bestelwagen</li>
            <li><b>Betaling:</b> 30 dagen na factuurdatum</li>
          </ul>
          <p>Met vriendelijke groet</p>
          <p>Amira El Idrissi<br>Sales binnendienst – Velomondo bv<br>09 216 40 40</p>
        </div>`,
      wat: `<p>Het <strong>bewijs dat de leverancier de bestelling ontvangen heeft én aanvaardt</strong>. Vanaf nu ligt de koop vast.</p>
            <p>De klant moet nu nog <em>niets betalen</em>.</p>`,
      wie: `<p>De <strong>sales binnendienst</strong> (verkoopdienst) van de leverancier stuurt het.</p>
            <p>Het gaat terug naar de klant die <strong>net besteld heeft</strong>.</p>`,
      inhoud: `<ul class="steps"><li>🔢 Ordernummer van de leverancier</li><li>🔁 Herhaling van de bestelde producten, aantallen en prijzen</li><li>🚚 Wanneer en hoe er geleverd wordt</li><li>📄 Afspraken over de betaling</li></ul>`
    },
    {
      id: 'ln',
      naam: 'Leveringsnota (leveringsbon)',
      html: `
        ${head('V2040')}
        <div class="meta-list">
          <div><span>Leveringsdatum:</span><span>20..-03-14</span></div>
          <div><span>Aantal colli:</span><span class="fill">4 dozen</span></div>
          <div><span>Gewicht:</span><span class="fill">18 kg</span></div>
          <div><span>Transport:</span><span class="fill">Bestelwagen Velomondo, nr.-plaat 2-GHT-418</span></div>
        </div>
        <table class="t">
          <thead><tr><th>Art. nr.</th><th>Omschrijving</th><th>Besteld</th><th>Geleverd</th></tr></thead>
          <tbody><tr><td>HU-M</td><td>${ART}</td><td class="n">40</td><td class="n">40</td></tr></tbody>
        </table>
        <div class="sign-solo">
          ${SIG_LUCAS}
          <div class="sign-lbl"><span>Voor ontvangst</span><span class="fill">Lucas Janssens<br>Trapkracht<br>Onder voorbehoud van nazicht</span></div>
        </div>
        ${FOOTER}`,
      wat: `<p>Het <strong>reist mee met de goederen</strong>.</p>
            <p>Als de klant het tekent, is er een <strong>bewijs dat de goederen geleverd</strong> zijn: wat, hoeveel en wanneer.</p>`,
      wie: `<p>De <strong>logistieke dienst</strong> (magazijn of expeditie) van de leverancier maakt het op.</p>
            <p>De chauffeur geeft het af bij de klant. Het getekende exemplaar gaat terug naar de leverancier.</p>`,
      inhoud: `<ul class="steps"><li>📦 Wat en hoeveel er geleverd wordt</li><li>🧱 Aantal dozen, gewicht en transport</li><li>🔢 Verwijzing naar het ordernummer</li><li>✍️ Handtekening van de klant, onder voorbehoud van nazicht</li><li>🚫 Geen bedrag te betalen</li></ul>`
    },
    {
      id: 'fa',
      naam: 'Factuur',
      html: `
        ${head('512', 'Verkooporder V2040')}
        <table class="t">
          <thead><tr><th>Btw-nummer klant</th><th>Klant-<br>nummer</th><th>Leverings-<br>datum</th><th>Datum</th><th>Vervaldag</th></tr></thead>
          <tbody><tr><td>BE 0654 321 987</td><td>50112</td><td>20..-03-14</td><td>20..-03-15</td><td>20..-04-14</td></tr></tbody>
        </table>
        <table class="t">
          <thead><tr><th>Art. nr.</th><th>Omschrijving</th><th>Aantal</th><th>Eenheidsprijs<br>(in EUR)</th><th>Bedrag excl. btw<br>(in EUR)</th></tr></thead>
          <tbody>
            <tr><td>HU-M</td><td>${ART}</td><td class="n">40</td><td class="n">40,00</td><td class="n">1 600,00</td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <table class="t mini right-block">
          <thead><tr><th>Maatstaf van heffing</th><th>% btw</th><th>Btw</th></tr></thead>
          <tbody><tr><td class="n">1 600,00</td><td class="c">21 %</td><td class="n">336,00</td></tr></tbody>
        </table>
        <div class="pay"><span>Totaal te betalen:</span><span>€</span><b>1 936,00</b></div>
        <p class="small">Te betalen vóór de vervaldag op BE62 0689 0412 3361, met vermelding van nummer 512.</p>
        ${FOOTER}`,
      wat: `<p>Hiermee vraagt de leverancier <strong>officieel om betaald te worden</strong> voor wat geleverd werd.</p>
            <p>Het vermeldt het bedrag zonder btw, de btw en het totaal, en <strong>tegen wanneer</strong> betaald moet worden.</p>`,
      wie: `<p>De <strong>boekhouding of facturatiedienst van de leverancier</strong> maakt het op, meestal met het ERP-pakket.</p>
            <p>Het gaat naar de klant, <strong>nadat de goederen geleverd zijn</strong>.</p>`,
      inhoud: `<ul class="steps"><li>🔢 Eigen nummer, datum en vervaldag</li><li>🧾 Btw-nummers van klant en leverancier</li><li>💶 Bedrag zonder btw, btw en totaal</li><li>🏦 Rekeningnummer om op te betalen</li></ul>`
    },
    {
      id: 'kl',
      naam: 'Klacht',
      html: `
        <div class="mail">
          <div class="mail-head">
            <div><b>Van:</b> <u>lucas@trapkracht.be</u></div>
            <div><b>Aan:</b> <u>amira.elidrissi@velomondo.be</u></div>
            <div><b>Datum:</b> 17 maart 20..</div>
            <div><b>Onderwerp:</b> ${BLANK} – levering order V2040 (nr. 512)</div>
          </div>
          <p>Beste Amira</p>
          <p>Op 14 maart ontvingen wij 40 stadshelmen <i>Urban</i> (order V2040).</p>
          <p>Bij het uitpakken merkten wij dat <b>5 helmen maat L</b> hebben in plaats van maat M. Wij hebben die helmen apart gezet en kunnen ze terugsturen.</p>
          <p>Wilt u het bedrag voor deze 5 helmen in mindering brengen op nr. 512? Wij betalen dan enkel de 35 juiste helmen.</p>
          <p>Wij tekenden bij de levering onder voorbehoud van nazicht.</p>
          <p>Vriendelijke groeten</p>
          <p>Lucas Janssens<br>Trapkracht</p>
        </div>`,
      wat: `<p>De klant laat weten dat er <strong>iets niet klopt</strong>: met de goederen, met de levering of met het bedrag.</p>
            <p>Hij vraagt de leverancier om het <strong>op te lossen</strong>.</p>`,
      wie: `<p>De <strong>klant</strong> stuurt het, bv. de aankoopdienst of iemand van het magazijn.</p>
            <p>Het gaat naar de <strong>leverancier</strong>, meestal per mail.</p>`,
      inhoud: `<ul class="steps"><li>🔗 Verwijzing naar het order of het nummer van het betalingsverzoek</li><li>⚠️ Wat er precies mis is</li><li>🛠️ Welke oplossing de klant voorstelt</li></ul>`
    },
    {
      id: 'cn',
      naam: 'Creditnota',
      html: `
        ${head('27')}
        <p class="lead">Verwijzing: nr. 512 van 20..-03-15 – verkooporder V2040</p>
        <p class="lead">Reden: retour van 5 helmen in maat L (verkeerde maat geleverd)</p>
        <table class="t">
          <thead><tr><th>Btw-nummer klant</th><th>Klantnummer</th><th>Datum</th></tr></thead>
          <tbody><tr><td>BE 0654 321 987</td><td>50112</td><td>20..-03-19</td></tr></tbody>
        </table>
        <table class="t">
          <thead><tr><th>Art. nr.</th><th>Omschrijving</th><th>Aantal</th><th>Eenheidsprijs<br>(in EUR)</th><th>Bedrag excl. btw<br>(in EUR)</th></tr></thead>
          <tbody><tr><td>HU-M</td><td>${ART}</td><td class="n">5</td><td class="n">40,00</td><td class="n">−200,00</td></tr></tbody>
        </table>
        <table class="t mini right-block">
          <thead><tr><th>Maatstaf van heffing</th><th>% btw</th><th>Btw</th></tr></thead>
          <tbody><tr><td class="n">−200,00</td><td class="c">21 %</td><td class="n">−42,00</td></tr></tbody>
        </table>
        <div class="total big"><b>Totaal in uw voordeel:</b> <b>−242,00</b></div>
        <p class="small">Dit bedrag wordt afgetrokken van het openstaande bedrag van nr. 512.</p>
        ${FOOTER}`,
      wat: `<p>Hiermee <strong>verlaagt de leverancier een bedrag</strong> dat de klant eerder moest betalen, bv. na een retour, beschadigde goederen of een fout.</p>
            <p>Het werkt in de <strong>omgekeerde richting</strong>: de bedragen zijn negatief.</p>`,
      wie: `<p>De <strong>boekhouding van de leverancier</strong> maakt het op, meestal na een melding van de klant.</p>
            <p>Het gaat naar de klant, en het bedrag wordt <strong>afgetrokken van wat nog openstaat</strong>.</p>`,
      inhoud: `<ul class="steps"><li>🔗 Verwijzing naar het oorspronkelijke betalingsverzoek</li><li>📝 Reden van de correctie</li><li>➖ Negatieve bedragen, met btw</li></ul>`
    }
  ];

  const TYPES = [
    { id: 'naam', label: 'Naam', short: 'Naam' },
    { id: 'wat', label: 'Wat is het?', short: 'Wat' },
    { id: 'wie', label: 'Van wie? Voor wie?', short: 'Van wie' },
    { id: 'inhoud', label: 'Wat is de inhoud?', short: 'Inhoud' }
  ];

  window.DS_DATA = { DOCS, TYPES };
  // Herkansingsmodus: max. 3 controles, enkel aantallen per soort kaartje als feedback
  window.DS_MODE = { herkansing: true, maxChecks: 3 };
})();
