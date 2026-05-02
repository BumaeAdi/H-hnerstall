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

Im Projektordner liegt bereits ein **Git-Repository** mit Branch **`main`** und einem ersten Commit. Du verbindest es nur noch mit GitHub und Vercel.

### 1. Repository auf GitHub anlegen

1. Auf [github.com/new](https://github.com/new) ein **neues Repository** erstellen (Name z. B. `huehnerstall`).
2. **Ohne** README, .gitignore oder Lizenz (leeres Repo), damit es keine Konflikte mit dem bestehenden Commit gibt.

### 2. Lokales Projekt mit GitHub verbinden und pushen

Im Terminal (Pfad anpassen, `DEIN_USER` und `REPO` ersetzen):

```bash
cd "c:\Users\adrian.baumann\Hühnerstall"
git remote add origin https://github.com/DEIN_USER/REPO.git
git push -u origin main
```

Bei SSH stattdessen: `git remote add origin git@github.com:DEIN_USER/REPO.git`

Falls GitHub nach einem Login fragt: **Personal Access Token** (Klassik) oder **GitHub Credential Manager** unter Windows verwenden.

### 3. Auf Vercel deployen

1. Auf [vercel.com](https://vercel.com) anmelden (z. B. mit GitHub).
2. **Add New… → Project** → dein Repository **Import** auswählen.
3. Vercel erkennt Vite meist automatisch. Prüfen:
   - **Framework Preset:** Vite  
   - **Build Command:** `npm run build`  
   - **Output Directory:** `dist`  
   - **Install Command:** `npm install` (Standard)
4. **Deploy** klicken. Nach dem Build erhältst du eine URL (z. B. `https://huehnerstall-xxx.vercel.app`).

Die Datei **`vercel.json`** sorgt dafür, dass alle Pfade auf `index.html` zeigen (SPA), damit z. B. `/app/dashboard` nach einem Reload funktioniert.

### Optional

- **Eigene Domain:** Vercel → Project → *Settings → Domains*.
- **Produktions-Branch:** *Settings → Git* (Standard meist `main`).

## Technik

- React 19, Vite 8, TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Recharts, React Router, Lucide Icons
- Manifest unter `public/manifest.json` (einfache „Add to Home Screen“-Basis ohne Service Worker)

## Lizenz

Privates Projekt – nach Bedarf anpassen.
