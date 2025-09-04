# Betting Tracker

En modern betting tracker byggd med React, TypeScript, Tailwind CSS och shadcn/ui.

## Funktioner

- ✅ Lägg till nya bets via formulär (datum, event, insats, odds, resultat)
- ✅ Översiktstabell över alla bets med sortering och filtrering
- ✅ Summering: total insats, total vinst/förlust, ROI, träffprocent
- ✅ Leaderboard där användare rankas efter ROI
- ✅ Hantera flera användare
- ✅ Export till CSV
- ✅ Responsiv design för mobil och desktop
- ✅ Data sparas i localStorage

## Teknik

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: react-hook-form + zod
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Datum**: date-fns
- **Notifications**: Sonner

## Installation och start

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
