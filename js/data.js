/* Documentenstroom – gegevens
 * De volgorde van DOCS is de juiste volgorde (oplossing).
 * Bron: "Logistiek en commerciële documenten kern 3" (kaartjes) en
 * "Documentenstroom – docs SLEUTEL" (documenten).
 * De naam van elk document is in de documenten zelf weggelaten (……).
 */
(function () {
  'use strict';

  const BLANK = '<span class="blank">…………………</span>';

  const LOGO = '<img class="logo" src="img/logo-spelco.png" alt="Logo Spel &amp; Co">';
  const SIG_LARS = '<img class="sig" src="img/handtekening-lars.png" alt="Handtekening Lars Huysmans">';
  const SIG_JELLE = '<img class="sig" src="img/handtekening-jelle.png" alt="Handtekening Jelle Verveke">';

  const KLANT = `
    <div class="addr">Urban Games<br>Wapenplein 21<br>8790&nbsp;&nbsp;&nbsp;WAREGEM<br>BE 0407 609 341<br>Klantnr. 40003</div>`;
  const LEVERANCIER = `
    <div class="addr right">Regenboog 7<br>2800 MECHELEN<br>BE 0401 089 654</div>`;
  const FOOTER = `
    <footer class="doc-foot">
      <div class="foot-top"><span>Spel &amp; Co bv</span><span>Tel. 015 40 70 44</span><span>www.spelenco.be</span></div>
      <div class="foot-grid">
        <span>Ondernemingsnummer: 0401 089 654</span><span class="r">RPR Antwerpen, afd. Mechelen</span>
        <span>KBC: BE33 7374 1801 2146</span><span class="r">ING: BE46 3900 4730 5036</span>
        <span>KREDBEBB</span><span class="r">BBRUBEBB</span>
      </div>
    </footer>`;

  function head(nummer) {
    return `
      <div class="doc-head">
        <div class="doc-title">${BLANK}<span class="fill">${nummer}</span></div>
        ${LOGO}
      </div>
      <div class="addr-row">${KLANT}${LEVERANCIER}</div>`;
  }

  const DOCS = [
    {
      id: 'pa',
      naam: 'Prijsaanvraag',
      html: `
        <div class="mail">
          <div class="mail-head">
            <div><b>Van:</b> <u>info@urban-games.be</u></div>
            <div><b>Aan:</b> <u>verkoop@spelenmeer.be</u></div>
            <div><b>Datum:</b> 19 september 20..</div>
            <div><b>Onderwerp:</b> ${BLANK} – draadloze hoofdtelefoons</div>
          </div>
          <p>Geachte heer/mevrouw,</p>
          <p>Wij zijn op zoek naar draadloze hoofdtelefoons (Bluetooth, zwart, over-ear). Graag ontvangen wij uw prijs per stuk bij een aankoop van 25 stuks.</p>
          <p>Kan u ook aangeven:</p>
          <ul>
            <li>of er een volumekorting mogelijk is</li>
            <li>wat de levertermijn is</li>
            <li>of er verzendkosten bijkomen</li>
          </ul>
          <p>Alvast bedankt voor uw snelle reactie.</p>
          <p>Met vriendelijke groet,<br>Jelle Verveke<br>Urban Games</p>
        </div>`,
      wat: `<p>Het is een formeel document waarin een klant aan een leverancier vraagt naar de prijs van een product of dienst.</p>
            <p>Het is <em>géén bestelling</em>! De klant wil eerst weten hoeveel het zou kosten, of er kortingen zijn, en wat de levertermijn is.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>aankoopdienst</strong> van een onderneming of door een <strong>zaakvoerder</strong> die iets wil inkopen.</p>
            <ul class="steps"><li>📤 Aankoopverantwoordelijke stuurt het naar leverancier</li><li>📩 Leverancier ontvangt en bekijkt het</li><li>⏳ Klant wacht op volgend document</li></ul>
            <p>Het wordt <strong>verzonden naar een leverancier</strong>.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Aankoopdienst klant</em></li><li>🧾 Omschrijving van product of dienst</li><li>🔢 Gewenste hoeveelheid</li><li>❓ Vragen: levering, kosten, kortingen</li><li>📬 Contactgegevens van de klant</li></ul>`
    },
    {
      id: 'po',
      naam: 'Offerte (prijsofferte)',
      html: `
        <div class="letter">
          <div class="letter-meta">
            <div><b>${BLANK} nr.:</b> 2025-UG051</div>
            <div><b>Datum:</b> 21 september 20…</div>
            <div><b>Klant:</b> Jelle Verveke, Urban Games</div>
          </div>
          <p>Geachte heer Verveke,</p>
          <p>Naar aanleiding van uw prijsaanvraag van 19 september 20… bezorgen wij u graag volgende offerte:</p>
          <p><b>Artikelnummer:</b> GE02<br><b>Product:</b> Draadloze hoofdtelefoon (Bluetooth, zwart, over-ear)</p>
          <p><b>Standaardprijs:</b> € 59,00 per stuk<br><b>Korting bij afname van minstens 25 stuks:</b> € 57,00 per stuk</p>
          <table class="t plain">
            <thead><tr><th>Artikel nr.</th><th>Omschrijving</th><th>Aantal</th><th>Prijs/stuk</th><th>Totaal</th></tr></thead>
            <tbody>
              <tr><td><b>GE02</b></td><td>Draadloze hoofdtelefoon</td><td class="n">25</td><td class="n">€ 59</td><td class="n">€ 1 475,00</td></tr>
              <tr><td></td><td><b>Korting bij 25 stuks</b></td><td></td><td class="n">- € 2</td><td class="n">- € 50</td></tr>
              <tr><td></td><td><b>Verzendkosten</b></td><td></td><td></td><td class="n">inbegrepen</td></tr>
              <tr><td></td><td><b>TOTAAL (excl. btw)</b></td><td></td><td></td><td class="n">€ 1 475,00</td></tr>
              <tr><td></td><td><b>BTW 21%</b></td><td></td><td></td><td class="n">€ 299,25</td></tr>
              <tr><td></td><td><b>TOTAAL (incl. btw)</b></td><td></td><td></td><td class="n">€ 1.724,25</td></tr>
            </tbody>
          </table>
          <p><b>Levertermijn:</b> 1 werkdag na bevestiging<br><b>Offerte geldig tot:</b> 5 oktober 20…</p>
          <p>Voor bijkomende vragen mag u steeds contact met ons opnemen. In bijlage vind je een lege …. die je kan gebruiken voor de bestelling.</p>
          <p>Met vriendelijke groet,</p>
          <p><b>Lars Huysmans</b><br><b>Spel &amp; Co – Verkoopdienst</b></p>
          <p>Regenboog 7<br>2800 Mechelen<br>BE04 0108 9654</p>
        </div>`,
      wat: `<p>Het is het antwoord van de leverancier op een prijsaanvraag van de klant.</p>
            <p>De leverancier geeft een <strong>duidelijke prijs</strong> voor het gevraagde product of dienst, met alle bijhorende <strong>voorwaarden</strong>.</p>
            <p><strong>Het is géén factuur of bestelling!</strong> De klant moet eerst nog beslissen of hij akkoord gaat met het voorstel.</p>`,
      wie: `<p>Het wordt opgemaakt door de <strong>verkoopdienst</strong> of de <strong>sales binnendienst</strong> van de leverancier.</p>
            <ul class="steps"><li>💬 Leverancier stelt het op met prijs en voorwaarden</li><li>📧 Het wordt verstuurd naar klant</li><li>🗂️ Klant vergelijkt document met andere leveranciers</li></ul>
            <p>Het document wordt <strong>verzonden naar de klant</strong> die een prijsaanvraag deed.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Verkoopdienst leverancier</em></li><li>🔢 Officiële nummering (optioneel)</li><li>🧾 Omschrijving van product of dienst</li><li>🔢 Prijs per stuk en totaalprijs</li><li>🎁 Eventuele korting</li></ul>`
    },
    {
      id: 'bb',
      naam: 'Bestelbon',
      html: `
        ${head('V1000')}
        <div class="meta-list">
          <div><span>Datum:</span><span class="fill">20..-09-23</span></div>
          <div><span>Leveringsdatum:</span><span class="fill">20..-09-24</span></div>
        </div>
        <p class="small">Speciale voorwaarden:<br>Korting bij bestelling van 25 koptelefoons:<br>57,00 EUR i.p.v. 59,00 EUR/stuk.</p>
        <table class="t">
          <thead><tr><th>Art.<br>nr.</th><th>Omschrijving</th><th>Aantal</th><th>Eenheidspr.<br>(excl. btw)</th><th>Bedrag<br>(excl. btw)</th></tr></thead>
          <tbody>
            <tr><td>GE02</td><td>Over-ear bluetooth koptelefoon</td><td class="n fill">25</td><td class="n fill">57,00</td><td class="n fill">1 425,00</td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div class="total"><b>Totaal goederen:</b> <span class="fill">1 425,00</span></div>
        <div class="sign-row">
          <div>${SIG_JELLE}<div class="sign-lbl"><span>Handtekening<br>Koper</span><span class="fill">Jelle Verveke<br>Urban Games</span></div></div>
          <div>${SIG_LARS}<div class="sign-lbl"><span>Handtekening<br>Verkoper</span><span class="fill">Lars Huysmans<br>Sales binnendienst<br>Spel &amp; Co</span></div></div>
        </div>
        ${FOOTER}`,
      wat: `<p>Het is een formeel document waarmee de klant bevestigt dat hij akkoord gaat met de offerte van de leverancier.</p>
            <p>De klant <strong>plaatst een bestelling</strong> van de producten of diensten die eerder werden besproken.</p>
            <p>Het bevat informatie over <strong>wat er besteld wordt</strong>, in welke hoeveelheid, tegen welke prijs en wanneer de levering verwacht wordt.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>aankoopdienst</strong> van de klant.</p>
            <ul class="steps"><li>🧾 Aankoopdienst maakt het op</li><li>📤 Het wordt verstuurd naar leverancier</li><li>📌 Bestelling krijgt unieke referentie</li></ul>
            <p>Het document wordt <strong>verzonden naar de leverancier</strong> nadat de klant akkoord gaat met de prijsofferte.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Aankoopdienst</em></li><li>🔢 Officiële nummering</li><li>🧾 Verwijzing naar de prijsofferte</li><li>📦 Omschrijving en hoeveelheid</li><li>💶 Prijs per stuk en totaalprijs</li><li>🚚 Gewenste leverdatum</li><li>✍️ Handtekening klant</li></ul>`
    },
    {
      id: 'ob',
      naam: 'Orderbevestiging',
      html: `
        ${head('V1000')}
        <table class="t mini right-block">
          <thead><tr><th>Ons ordernr.</th><th>Uw kenmerk</th><th>Datum</th></tr></thead>
          <tbody><tr><td class="fill big">V1000</td><td></td><td>20..-09-23</td></tr></tbody>
        </table>
        <p>Geachte klant</p>
        <p>Dank voor uw bestelling.<br>Gelieve in uw communicatie ons ordernummer steeds te vermelden.</p>
        <table class="t">
          <thead><tr><th>Art.<br>nr.</th><th>Omschrijving</th><th>Aantal</th><th>Prijs</th><th>Bedrag<br>(in EUR)</th></tr></thead>
          <tbody>
            <tr><td>GE02</td><td>Over-ear bluetooth koptelefoon</td><td class="n">25</td><td class="n">57,00</td><td class="n">1 425,00</td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div class="total"><b>Totaal goederen:</b> <b>1 425,00</b></div>
        <p><b>Bijzondere voorwaarden:</b></p>
        <div class="meta-list">
          <div><span>Voorziene leveringsdatum:</span><span class="fill">20..-09-24</span></div>
          <div><span>Betaling:</span><span class="fill">30 dagen na factuurdatum</span></div>
          <div><span>Transport:</span><span class="fill">Bestelwagen nr-plaat 1XVJ877</span></div>
        </div>
        <p>Graag tot uw dienst</p>
        ${SIG_LARS}
        <p>Lars Huysmans<br>Sales binnendienst</p>
        ${FOOTER}`,
      wat: `<p>Het is een document dat de leverancier opmaakt als antwoord op een <strong>bestelbon</strong> van een klant.</p>
            <p>Het bevestigt dat de bestelling werd ontvangen én aanvaard. Hiermee wordt de koop officieel. Het vermeldt eventueel een track &amp; trace code.</p>
            <p>Dit is <em>GEEN FACTUUR</em>: het bevestigt dat de bestelling werd aanvaard, terwijl een factuur een betalingsverzoek is voor die bestelling.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>sales binnendienst</strong> of <strong>verkoopdienst</strong> van de leverancier.</p>
            <ul class="steps"><li>📨 Leverancier bevestigt ontvangst van de bestelling</li><li>🔄 Odoo verandert status naar "bevestigd"</li><li>📂 Bestelling wordt voorbereid voor levering</li></ul>
            <p>Het document wordt <strong>verzonden naar de klant</strong> die een bestelling heeft geplaatst.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Verkoopdienst</em></li><li>🔢 Vermelding ordernummer (bv. V1000)</li><li>📦 Herhaling van bestelde producten, prijs en hoeveelheid</li><li>🚚 Leveringsdatum</li><li>📄 Bijzondere voorwaarden (zoals transport, betaling)</li></ul>`
    },
    {
      id: 'ln',
      naam: 'Leveringsnota (leveringsbon)',
      html: `
        ${head('V1000')}
        <div class="meta-list">
          <div><span>Leveringsdatum:</span><span>20..-09-24</span></div>
          <div><span>Verpakking:</span><span class="fill">5 dozen</span></div>
          <div><span>Gewicht:</span><span class="fill">16 kg</span></div>
          <div><span>Transport:</span><span class="fill">Bestelwagen, nr. plaat 1XVJ877</span></div>
        </div>
        <table class="t">
          <thead><tr><th>Art. nr.</th><th>Omschrijving</th><th>Aantal</th><th>Eenheidspr.</th></tr></thead>
          <tbody><tr><td>GE02</td><td>Over-ear bluetooth koptelefoon</td><td class="n">25</td><td class="n">57,00</td></tr></tbody>
        </table>
        <div class="sign-solo">
          ${SIG_JELLE}
          <div class="sign-lbl"><span>Handtekening klant</span><span class="fill">Jelle Verveke<br>Urban Games<br>Onder voorbehoud van later nazicht</span></div>
        </div>
        ${FOOTER}`,
      wat: `<p>Het is een officieel transportdocument dat aantoont <strong>welke goederen verzonden worden</strong>, <strong>waarheen</strong> en <strong>wanneer</strong>.</p>
            <p>Het is een bewijs dat de goederen effectief verzonden zijn en ontvangen werden.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>logistiek medewerker</strong> van de leverancier.</p>
            <ul class="steps"><li>🚚 Zorgt voor expeditie</li><li>🖨️ Print het document in 2 exemplaren</li><li>📬 Stuurt mee met levering</li><li>📎 Stuurt ondertekend document door naar facturatie</li></ul>
            <p>Het document wordt <strong>verzonden naar de klant</strong> bij de levering.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Logistiek</em></li><li>🔢 Verwijzing naar order en klant</li><li>📦 Overzicht van verzonden goederen</li><li>✍️ Handtekening klant: <em>onder voorbehoud van later nazicht</em></li></ul>`
    },
    {
      id: 'fa',
      naam: 'Factuur',
      html: `
        <div class="doc-head">
          <div class="doc-title">${BLANK}<span>331</span><div class="sub">Verkooporder V1000</div></div>
          ${LOGO}
        </div>
        <div class="addr-row"><div class="addr">Urban Games<br>Wapenplein 21<br>8790 WAREGEM</div>${LEVERANCIER}</div>
        <table class="t">
          <thead><tr><th>Btw-nummer klant</th><th>Klant-<br>nummer</th><th>Leverings-<br>datum</th><th>Vervaldag</th><th>Factuur-<br>datum</th></tr></thead>
          <tbody><tr><td>BE 0405 107 731</td><td>40003</td><td>20..-09-24</td><td>20..-10-23</td><td>20..-09-25</td></tr></tbody>
        </table>
        <table class="t">
          <thead>
            <tr><th rowspan="2">Artikel-<br>nummer</th><th rowspan="2">Omschrijving</th><th rowspan="2">Aantal</th><th rowspan="2">Eenheids-<br>prijs<br>(in EUR)</th><th colspan="2">Bedrag (in EUR)</th></tr>
            <tr><th>6 %</th><th>21 %</th></tr>
          </thead>
          <tbody>
            <tr><td>GE02</td><td>Over-ear bluetooth koptelefoon</td><td class="n">25</td><td class="n">57,00</td><td></td><td class="n">1 425,00</td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
        <div class="total"><b>Totaal goederen:</b> <b>1 425,00</b></div>
        <table class="t mini right-block">
          <thead><tr><th>MvH</th><th>% btw</th><th>Btw</th></tr></thead>
          <tbody>
            <tr><td></td><td class="c">6 %</td><td></td></tr>
            <tr><td class="n">1 425,00</td><td class="c">21 %</td><td class="n">299,25</td></tr>
            <tr><td class="n"><b>1 425,00</b></td><td></td><td class="n"><b>299,25</b></td></tr>
          </tbody>
        </table>
        <div class="pay"><span>Totaal te betalen:</span><span>€</span><b>1 724,25</b></div>
        ${FOOTER}`,
      wat: `<p>Het is een officieel betalingsverzoek van de leverancier aan de klant.</p>
            <p>Het document geeft een volledig overzicht van <strong>wat de klant moet betalen</strong>, inclusief btw, betalingsvoorwaarden en vervaldatum.</p>
            <p>Het wordt opgesteld <strong>nadat de goederen geleverd zijn</strong> en <strong>na ondertekening van de leveringsnota</strong>.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>boekhoud- of facturatiedienst</strong> van de leverancier.</p>
            <ul class="steps"><li>💻 Gebruikt ERP om het document te genereren</li><li>📄 Stuurt het naar klant</li><li>📎 Verwijst naar bestelbon en leveringsnota</li></ul>
            <p>Het document wordt <strong>verzonden naar de klant</strong> na ontvangst goederen.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Boekhouding</em></li><li>🔢 Klantnummer, factuurnummer, btw-nummers</li><li>📦 Omschrijving van geleverde producten</li><li>💶 Prijs, btw-percentage, totaal te betalen</li><li>📅 Vervaldatum betaling</li></ul>`
    },
    {
      id: 'kl',
      naam: 'Klacht',
      html: `
        <div class="mail">
          <div class="mail-head">
            <div><b>Van:</b> <u>jelle.verveke@urbangames.be</u></div>
            <div><b>Aan:</b> <u>lars.huysmans@spelenco.be</u></div>
            <div><b>Datum:</b> 26 september 20…</div>
            <div><b>Onderwerp:</b> ${BLANK} – levering bluetooth koptelefoons (order V1000)</div>
          </div>
          <p>Geachte heer Huysmans,</p>
          <p>Op 24 september ontvingen wij de levering van 25 bluetooth koptelefoons (bestelbon V1000).</p>
          <p>Bij het openen van de dozen merkten wij dat <b>5 stuks beschadigd</b> zijn (krassen op de hoofdband en verpakking gedeukt).</p>
          <p>We vragen u vriendelijk om ons een creditnota op te maken voor deze 5 stuks, of indien mogelijk vervangexemplaren op te sturen.</p>
          <p>De leveringsnota werd ondertekend onder voorbehoud van nazicht.</p>
          <p>In bijlage vindt u enkele foto's van de schade.</p>
          <p>Met vriendelijke groet,</p>
          <p><b>Jelle Verveke</b><br>Aankoopdienst – Urban Games</p>
        </div>`,
      wat: `<p>Het is een formeel bericht van de klant aan de leverancier waarin hij meldt dat er iets <strong>niet in orde is</strong> met de levering of facturatie.</p>
            <p>Het kan betrekking hebben op:</p>
            <ul><li>foute levering (verkeerde hoeveelheid, verkeerd artikel)</li><li>beschadigde goederen</li><li>niet-conforme producten</li><li>fout in de factuur (prijs, btw, artikel, enz.)</li></ul>
            <p>Het is géén juridisch conflict, maar wel een poging tot oplossing via communicatie.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>klant</strong> (meestal de aankoopdienst of magazijnmedewerker).</p>
            <ul class="steps"><li>📦 Ontvangt levering</li><li>🔍 Merkt probleem op</li><li>📧 Stelt het op en mailt dit naar leverancier</li></ul>
            <p>Het wordt <strong>schriftelijk verstuurd</strong> naar de leverancier, vaak via mail.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Aankoop / Magazijn</em></li><li>🔢 Verwijzing naar order of factuur</li><li>📦 Duidelijke omschrijving van het probleem</li><li>💡 Vraag naar oplossing (vervanging, creditnota, …)</li></ul>`
    },
    {
      id: 'cn',
      naam: 'Creditnota',
      html: `
        <div class="doc-head">
          <div class="doc-title xl">${BLANK}<span>331</span></div>
          ${LOGO}
        </div>
        <p class="lead">Verwijzing naar factuur: nr. 331 – factuurdatum 20..-09-25</p>
        <div class="addr-row">
          <p class="lead">Reden: Retour van 5 bluetooth koptelefoons (artikel GE02)</p>
          ${LEVERANCIER}
        </div>
        <table class="t">
          <thead><tr><th>Btw-nummer klant</th><th>Klant-<br>nummer</th><th>Leverings-<br>datum</th><th>Vervaldag</th><th>Datum</th></tr></thead>
          <tbody><tr><td>BE 0405 107 731</td><td>40003</td><td>20..-09-24</td><td>20..-10-23</td><td>20..-09-29</td></tr></tbody>
        </table>
        <table class="t">
          <thead><tr><th>Artikel-<br>nummer</th><th>Omschrijving</th><th>Aantal</th><th>Eenheids-<br>prijs (in EUR)</th><th>Bedrag<br>(in EUR)</th></tr></thead>
          <tbody><tr><td>GE02</td><td>Over-ear bluetooth koptelefoon</td><td class="n">5</td><td class="n">57,00</td><td class="n">−285,00</td></tr></tbody>
        </table>
        <div class="total"><b>Totaal goederen:</b> <b>−285,00</b></div>
        <table class="t mini right-block">
          <thead><tr><th>MvH</th><th>% btw</th><th>Btw</th></tr></thead>
          <tbody><tr><td class="n">−285,00</td><td class="c">21 %</td><td class="n">−59,85</td></tr></tbody>
        </table>
        <div class="total big"><b>Totaal terug te krijgen:</b> <b>−344,85</b></div>
        ${FOOTER}`,
      wat: `<p>Het is een correctiedocument dat een leverancier opmaakt als er een deel van een factuur <strong>niet betaald moet worden</strong>, bijvoorbeeld omdat:</p>
            <ul><li>goederen beschadigd zijn of niet geleverd</li><li>een fout gemaakt werd in de factuur</li><li>goederen worden teruggestuurd</li></ul>
            <p>Het is het tegenovergestelde van een factuur: het verlaagt het te betalen bedrag.</p>`,
      wie: `<p>Het wordt opgesteld door de <strong>boekhoud- of facturatiedienst</strong> van de leverancier.</p>
            <ul class="steps"><li>📄 Stelt het op in ERP</li><li>🔗 Verwijst naar originele factuur</li><li>📦 Vermeldt teruggestuurde hoeveelheid</li><li>💶 Past totaalbedrag en btw aan</li></ul>
            <p>Het wordt <strong>verstuurd naar de klant</strong> en <strong>afgetrokken van het openstaand factuurbedrag</strong>.</p>`,
      inhoud: `<ul class="steps"><li>📅 Datum</li><li>📎 <em>Afdeling: Boekhouding</em></li><li>🔢 Verwijzing naar factuur nr. 331</li><li>📦 Correctie op 5 teruggestuurde producten</li><li>📉 Bedrag wordt in mindering gebracht op factuur</li></ul>`
    }
  ];

  const TYPES = [
    { id: 'naam', label: 'Naam', short: 'Naam' },
    { id: 'wat', label: 'Wat is het?', short: 'Wat' },
    { id: 'wie', label: 'Van wie? Voor wie?', short: 'Van wie' },
    { id: 'inhoud', label: 'Wat is de inhoud?', short: 'Inhoud' }
  ];

  window.DS_DATA = { DOCS, TYPES };
})();
