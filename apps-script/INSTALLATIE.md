# Koppeling met Google Sheets installeren (± 10 minuten)

Je doet dit één keer. Daarna bewaart de app het werk van elke leerling in je spreadsheet, en bekijk je de resultaten op `leerkracht.html`.

**Toestemmingen zo beperkt mogelijk:** het script mag alleen de spreadsheet lezen en bewerken waarin het geïnstalleerd is. Het krijgt geen toegang tot je Drive, andere bestanden, Gmail of agenda. Daarvoor is het belangrijk dat je het script opent **vanuit de spreadsheet** (stap 1) en de manifest-instelling van stap 1b doet.

## 1. Script in de spreadsheet plakken

1. Open je spreadsheet (ID `1PkZ4NKyxBWeD8m1bkfgak4CjhwiVlT7T5etCzDhR6qA`).
2. Menu **Extensies → Apps Script**. (Niet via script.google.com een los project maken: dan werkt de beperking tot deze ene sheet niet.)
3. Wis alles in `Code.gs` en plak de volledige inhoud van [`Code.gs`](Code.gs) uit deze map.
4. Pas bovenaan het wachtwoord aan:
   ```js
   const LEERKRACHT_WACHTWOORD = 'verander-mij';
   ```
   Kies iets dat leerlingen niet raden. Dit wachtwoord typ je later op de leerkrachtpagina.
5. Klik op 💾 **Opslaan**.

## 1b. Toestemmingen vastleggen (manifest)

1. Klik links op ⚙️ **Projectinstellingen**.
2. Vink **Manifestbestand "appsscript.json" in editor weergeven** aan.
3. Ga terug naar de **Editor** (`< >` links). Open `appsscript.json`.
4. Wis alles en plak de inhoud van [`appsscript.json`](appsscript.json) uit deze map. Sla op.

Daarin staat dat het script maar één toestemming mag vragen: `spreadsheets.currentonly` (alleen deze spreadsheet).

## 2. Eén keer uitvoeren (toestemming geven)

1. Kies bovenaan in de lijst met functies **installeer** en klik op **▶ Uitvoeren**.
2. Google vraagt toestemming: **Toestemmingen controleren** → kies je account → (eventueel *Geavanceerd → Ga naar … (onveilig)*). Kijk na dat er maar **één** toestemming gevraagd wordt, ongeveer: *“Spreadsheets bekijken en bewerken waarin deze app is geïnstalleerd”*. Vraagt Google meer (bv. “al je spreadsheets” of “Google Drive”), stop dan en kijk stap 1 en 1b na. Klik op **Toestaan**.

   “Onveilig” betekent alleen dat Google het script niet zelf gecontroleerd heeft; het is je eigen script.
3. In je spreadsheet verschijnt een tabblad **Resultaten** met kolomkoppen.

## 3. Publiceren als web-app

1. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
2. Klik op het tandwiel naast *Type selecteren* → **Web-app**.
3. Vul in:
   - *Beschrijving*: Documentenstroom
   - *Uitvoeren als*: **Ik** (jouw account)
   - *Wie heeft toegang*: **Iedereen**
4. Klik op **Implementeren** en kopieer de **URL van de web-app** (eindigt op `/exec`).

Zie je bij *Wie heeft toegang* alleen “Iedereen binnen De MET”? Dan laat je schoolaccount “Iedereen” niet toe. Vraag dan aan ICT om dat toe te staan voor Apps Script-webapps.

## 4. URL in de app zetten

Zet de URL in [`js/config.js`](../js/config.js):

```js
window.DS_CONFIG = {
  scriptUrl: 'https://script.google.com/macros/s/…/exec'
};
```

Of bezorg de URL aan Claude, dan wordt dat voor je gedaan.

## Wat staat er in de sheet?

**Tabblad Resultaten:** één rij per leerling (en een aparte rij “Naam (herkansing)” voor de herkansing). Je ziet naam, pincode, status (bezig / alles juist / ingeleverd), aantal controles, score bij de 1e controle en op het einde, inschatting, enz. Pas de kolom **Toestand** niet aan: daarmee kan de leerling verder werken.

**Tabblad Controles:** de historiek. Er komt een rij bij elke keer dat een leerling op **Controleer** klikt, in de basisversie én in de herkansing. Elke rij bevat:
- naam en versie (basis of herkansing);
- de hoeveelste controle het is, en het tijdstip;
- het totaal aantal juist (op 40);
- het aantal juist per onderdeel (op 8): volgorde, naam, wat is het?, van wie? voor wie? en wat is de inhoud?

Filter op een naam om de historiek van één leerling te zien. Wis je een leerling met *Leerling wissen*, dan blijft de historiek staan met versie “basis (gewist)”.

- **Leerling vergat de pincode?** Je ziet de pincode in de sheet en op de leerkrachtpagina.
- **Leerling moet opnieuw beginnen?** Klik op de leerkrachtpagina op *Leerling wissen*, of verwijder de rij in de sheet.

## Script later aanpassen

Pas je het script aan, gebruik dan **Implementeren → Implementaties beheren → ✏️ → Versie: Nieuwe versie → Implementeren**. Zo blijft de URL dezelfde.

### Bijwerken naar de versie met historiek (tabblad Controles)

1. Open de spreadsheet → **Extensies → Apps Script**.
2. Kopieer je wachtwoord uit de regel `const LEERKRACHT_WACHTWOORD = '…';`.
3. Wis alles in `Code.gs` en plak de nieuwe [`Code.gs`](Code.gs). Zet je wachtwoord terug en klik op 💾 **Opslaan**.
4. Kies de functie **historiekAanvullen** en klik op **▶ Uitvoeren**. Het tabblad **Controles** verschijnt, met daarin alle controles die al gebeurden. Je kan dit gerust opnieuw uitvoeren: er komt niets dubbel.
5. **Implementeren → Implementaties beheren → ✏️ → Versie: Nieuwe versie → Implementeren.** De URL blijft dezelfde, dus je hoeft in de app niets aan te passen.
