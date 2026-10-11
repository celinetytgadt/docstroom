# Documentenstroom

Evaluatie-app voor het leerdoel *documentenstroom* (logistieke en commerciële documenten).

Leerlingen krijgen 8 documenten van één bestelling (Urban Games ↔ Spel & Co) in willekeurige volgorde, zonder de naam van het document. Ze moeten:

1. de documenten in de juiste volgorde leggen;
2. bij elk document 4 kaartjes leggen: **naam**, **wat is het?**, **van wie? voor wie?** en **wat is de inhoud?**

Slepen en klikken werken allebei (ook op touchscreens). Bij **Controleer** kleuren fouten rood, zodat de leerling opnieuw kan proberen. Elke controle wordt bijgehouden.

## Pagina's

| Pagina | Voor wie | Wat |
| --- | --- | --- |
| `index.html` | leerlingen | de oefening; op het einde krijgt de leerling een **resultaatcode** (kopiëren of downloaden als .txt) |
| `leerkracht.html` | leerkracht | codes of .txt-bestanden inlezen → klasoverzicht, details per leerling, fouten per controle, wat de klas kent, CSV-export |

Er is geen server of account nodig: alles draait in de browser. De voortgang van de leerling wordt lokaal bewaard (herladen = niet alles kwijt).

## Hoe zie je of een leerling gokte?

Per onderdeel (volgorde + 32 kaartjes = 40 punten) toont het overzicht bij welke controle het juist werd en of een juist antwoord later weer fout werd (↺). De inschatting kijkt vooral naar de score bij de **eerste controle**:

- **Kent het**: ≥ 90 % juist bij de 1e controle
- **Kent het grotendeels**: ≥ 70 % en max. 4 controles
- **Waarschijnlijk gegokt**: < 50 % bij de 1e controle, ≥ 6 controles of vaak juist → fout
- anders **Twijfelt**

De leerkrachtpagina meldt ook als een code werd aangepast (controlegetal klopt niet) of als een leerling op dezelfde computer opnieuw begon.

## Online zetten (GitHub Pages)

Repository → *Settings* → *Pages* → *Deploy from a branch* → kies de branch en map `/ (root)`. Leerlingen gebruiken dan `https://<gebruiker>.github.io/docstroom/` en de leerkracht `…/docstroom/leerkracht.html`.

## Inhoud aanpassen

Alle documenten en kaartjes staan in `js/data.js`. De volgorde van `DOCS` is de oplossing.
