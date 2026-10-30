# Rondevoetbal

Een uitbreidbare browsergame met top-down voetbal, genummerde spelers, packs en upgrades.

## Spelen
Open `index.html` in je browser, of publiceer de repository met **GitHub Pages** (Settings → Pages → Deploy from a branch → `main` → `/root`).

## Besturing
- WASD of pijltjestoetsen: bewegen
- Spatie: schieten (de speler mikt richting het doel)
- Shift: sprinten

Je bestuurt automatisch de speler die de bal heeft, anders de speler die het dichtst bij de bal staat. Teamgenoten en tegenstanders bewegen automatisch.

## Spelersystemen
- Het getal op de cirkel is de rating/puntenwaarde.
- Snelheid: +10% basissnelheid per punt, met een maximum van 300% basissnelheid.
- Balverovering: 30% basiskans + 2 procentpunt per punt, maximaal 90%.
- Schietnauwkeurigheid: vermindert de willekeurige afwijking van een schot.
- Packs kosten 100 munten. Zeldzaamheid neemt toe met de rating.
- Upgrades kosten 40 munten per punt.

## Uitbreiden
De game is bewust vanilla HTML/CSS/JS. Spelers staan in `squad`, spelregels in `game.js` en de interface in `index.html`/`style.css`. Voeg bijvoorbeeld posities, formaties, online multiplayer, keeper-AI, inventaris en opslag toe.
