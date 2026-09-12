# Web Template

Neutrale statische Vorlage für interaktive Lern-, Quiz- und Trainingsseiten.

## Struktur

- `index.html`: Seitenstruktur und UI
- `app/main.js`: Daten laden, Navigation, Lern- und Testablauf
- `style/main.css`: responsives Layout und Theme
- `data/categories.json`: Liste der Daten-Dateien
- `data/demo.json`: Dummy-Kategorien und Beispielkarten

## Start

Im Template-Ordner einen lokalen Webserver starten:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen.

## Eigene Daten verwenden

1. Erstelle eine JSON-Datei nach dem Muster von `data/demo.json`.
2. Trage den Dateinamen in `data/categories.json` ein.
3. Passe Texte, Farben und Verhalten in `index.html`, `app/main.js` und `style/main.css` an.

Die Vorlage benötigt keine externen Abhängigkeiten oder Build-Schritte.
