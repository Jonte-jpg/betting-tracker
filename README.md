# Betting Tracker

En modern betting tracker byggd med React, TypeScript, Tailwind CSS och shadcn/ui. Tillgänglig som webbapp (PWA) och native Windows-applikation.

## 📥 Ladda ner

### Windows Desktop App
- **Ladda ner:** [Senaste versionen](https://github.com/Jonte-jpg/betting-tracker/releases/latest)
- **Format:** MSI (rekommenderat) eller EXE
- **Krav:** Windows 10 eller senare (64-bit)

### Webbapp/PWA
- **URL:** [https://jonte-jpg.github.io/betting-tracker](https://jonte-jpg.github.io/betting-tracker)
- **Installation:** Klicka "Installera" i webbläsaren för PWA

## ✨ Funktioner

- ✅ Lägg till nya bets via formulär (datum, event, insats, odds, resultat)
- ✅ Översiktstabell över alla bets med sortering och filtrering  
- ✅ Summering: total insats, total vinst/förlust, ROI, träffprocent
- ✅ Leaderboard där användare rankas efter ROI
- ✅ Hantera flera användare
- ✅ Export till CSV
- ✅ Responsiv design för mobil och desktop
- ✅ Data sparas i localStorage (persistent mellan sessioner)
- ✅ PWA-stöd (installera som app)
- ✅ Native Windows-app (Tauri)

## 🛠️ Teknik

- **Frontend**: React 18 + TypeScript
- **Desktop**: Tauri (Rust + WebView)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: react-hook-form + zod
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Datum**: date-fns
- **Notifications**: Sonner

## 🚀 Installation och start

### Utveckling (Webbapp)

```bash
# Installera dependencies
npm install

# Starta development server
npm run dev

# Bygga för produktion
npm run build

# Förhandsgranska build
npm run preview
```

### Utveckling (Desktop)

**Krav:**
- Node.js 18+
- Rust (installera via [rustup.rs](https://rustup.rs/))
- Windows: Visual Studio Build Tools eller Visual Studio Community

```bash
# Installera dependencies (inkluderar Tauri CLI)
npm install

# Starta Tauri development (öppnar desktop-appen)
npm run tauri:dev

# Bygga desktop-installer
npm run tauri:build
```

Efter `npm run tauri:build` hittar du installationsfilerna här:
- **MSI:** `src-tauri/target/release/bundle/msi/`
- **EXE:** `src-tauri/target/release/bundle/nsis/`

## 📦 Releases

### Skapa en release

```bash
# 1. Committa alla ändringar
git add .
git commit -m "Release v1.0.0"

# 2. Skapa och pusha tag
git tag v1.0.0
git push origin main
git push origin v1.0.0

# 3. GitHub Actions bygger automatiskt och skapar release
# med MSI och EXE installer som assets
```

### Automatisk process
- GitHub Actions triggas på tags som börjar med `v*`
- Bygger både webbapp och desktop-app
- Skapar GitHub Release med installationsfiler
- Webbappen uppdaterar automatiskt download-länkar

## 🔧 Felsökning

### Windows Build-problem

**"Windows SDK not found":**
```bash
# Installera Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

**"Rust toolchain not found":**
```bash
# Installera Rust
winget install Rustlang.Rustup
# Eller via https://rustup.rs/
```

**"WebView2 not found":**
```bash
# Installera WebView2 Runtime
winget install Microsoft.EdgeWebView2
```

### Development-problem

**"Module not found":**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Tauri command not found":**
```bash
npm install --save-dev @tauri-apps/cli
```

## Projektstruktur

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Huvudkomponent
├── types/                # TypeScript typer
│   ├── Bet.ts
│   └── User.ts
├── store/                # Zustand store
│   └── useAppStore.ts
├── components/
│   ├── bets/             # Bet-relaterade komponenter
│   │   ├── AddBetForm.tsx
│   │   └── BetsTable.tsx
│   ├── summary/          # Sammanfattning
│   │   └── SummaryCards.tsx
│   ├── leaderboard/      # Leaderboard
│   │   └── Leaderboard.tsx
│   ├── settings/         # Inställningar
│   │   └── SettingsPanel.tsx
│   ├── layout/           # Layout komponenter
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   └── ui/               # shadcn/ui komponenter
├── lib/                  # Hjälpfunktioner
│   ├── calc.ts           # Beräkningar
│   ├── format.ts         # Formatering
│   ├── csv.ts            # CSV export
│   ├── storage.ts        # LocalStorage
│   └── utils.ts          # Utilities
├── hooks/                # Custom hooks
│   └── useLocalStorage.ts
└── styles/
    └── globals.css       # Global styles
```

## Data & Beräkningar

### ROI Formel
```
ROI = (Summa vinst/förlust / Summa insats) * 100
```

### Vinst/förlust per bet (decimalodds)
- **Won**: stake * (odds - 1) 
- **Lost**: -stake
- **Void/Pending**: 0

### Leaderboard
Sorteras efter:
1. ROI (fallande)
2. Netto vinst (fallande) 
3. Antal bets (fallande)

Minimikrav för officiell ranking: 5 bets (annars "Provisorisk")

## Seeddata

Appen startar med 3 exempelanvändare (Anna, Björn, Carla) och 20 exempelbets för att demonstrera funktionaliteten.

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Utveckling

```bash
# Linting
npm run lint

# Type checking  
npm run typecheck

# Formattering
npm run format
```

All data sparas i localStorage under nyckeln `betting-tracker:v1`.
