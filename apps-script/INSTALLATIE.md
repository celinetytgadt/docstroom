# Koppeling met Google Sheets installeren (± 10 minuten)

Je doet dit één keer. Daarna bewaart de app het werk van elke leerling in je spreadsheet, en zie je alles live op `leerkracht.html`.

## 1. Script in de spreadsheet plakken

1. Open je spreadsheet (ID `1PkZ4NKyxBWeD8m1bkfgak4CjhwiVlT7T5etCzDhR6qA`).
2. Menu **Extensies → Apps Script**.
3. Wis alles in `Code.gs` en plak de volledige inhoud van [`Code.gs`](Code.gs) uit deze map.
4. Pas bovenaan het wachtwoord aan:
   ```js
   const LEERKRACHT_WACHTWOORD = 'verander-mij';
   ```
   Kies iets dat leerlingen niet raden. Dit wachtwoord typ je later op de leerkrachtpagina.
5. Klik op 💾 **Opslaan**.

## 2. Eén keer uitvoeren (toestemming geven)

1. Kies bovenaan in de lijst met functies **installeer** en klik op **▶ Uitvoeren**.
2. Google vraagt toestemming: **Toestemmingen controleren** → kies je account → (eventueel *Geavanceerd → Ga naar … (onveilig)*) → **Toestaan**.
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

Eén rij per leerling: naam, pincode, status (bezig / alles juist / ingeleverd), aantal controles, score bij de 1e controle en op het einde, inschatting, enz. Pas de kolom **Toestand** niet aan: daarmee kan de leerling verder werken.

- **Leerling vergat de pincode?** Je ziet de pincode in de sheet en op de leerkrachtpagina.
- **Leerling moet opnieuw beginnen?** Klik op de leerkrachtpagina op *Leerling wissen*, of verwijder de rij in de sheet.

## Script later aanpassen

Pas je het script aan, gebruik dan **Implementeren → Implementaties beheren → ✏️ → Versie: Nieuwe versie → Implementeren**. Zo blijft de URL dezelfde.
