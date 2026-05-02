# Hühnerstall

Web-App zur Verwaltung eines gemeinsamen Hühnerstalls (Familie Baumann & Familie Schmid): Eier, Mistung, Fütterung, Kosten mit Aufteilung, Bestand, Notizen, Historie und Statistik. Daten werden im **Browser (LocalStorage)** gespeichert.

## Voraussetzungen

- Node.js 20+ (empfohlen)
- npm

## Lokal starten

```bash
npm install
npm run dev
```

Anschließend die im Terminal angezeigte URL öffnen (üblicherweise `http://localhost:5173`).

**Login (MVP-PINs)**

- Familie Baumann, PIN: `1234`
- Familie Schmid, PIN: `5678`

Es werden keine Beispiel-Einträge mehr automatisch angelegt. Alte Demo-Daten aus früheren Versionen kannst du unter **Historie → Alles leeren** entfernen.

## Produktions-Build

```bash
npm run build
npm run preview
```

## Umlaute & Zeichenkodierung

Alle Texte sind auf **UTF-8** ausgelegt (ä, ö, ü, ß). Editor und Git sollten UTF-8 verwenden (Standard in VS Code/Cursor). `index.html` nutzt `charset="UTF-8"`.

## Deployment: GitHub + Vercel

1. **GitHub:** Repository anlegen, dieses Projekt committen und pushen.
2. **Vercel:** [vercel.com](https://vercel.com) → *Add New…* → *Project* → GitHub-Repository importieren.
3. Einstellungen:
   - **Framework Preset:** Vite (oder „Other“ mit Build `npm run build`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Die Datei `vercel.json` leitet alle Routen auf `index.html` um, damit die React-Router-URLs (z. B. `/app/dashboard`) nach einem Reload funktionieren.

Optional: In Vercel unter *Settings → Git* den Produktions-Branch festlegen.

## Technik

- React 19, Vite 8, TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Recharts, React Router, Lucide Icons
- Manifest unter `public/manifest.json` (einfache „Add to Home Screen“-Basis ohne Service Worker)

## Lizenz

Privates Projekt – nach Bedarf anpassen.
