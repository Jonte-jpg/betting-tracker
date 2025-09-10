# Installationsfiler

Denna mapp innehåller installationsfiler för BettingTracker desktop-appen.

## Instruktioner för att lägga till filer:

### För MSI-filer (fungerar med Firebase gratis plan):
```powershell
# Kopiera din MSI-fil hit
Copy-Item "path\to\din\BettingTracker_x64.msi" "public\downloads\"

# Bygg och deploya
npm run build
firebase deploy
```

### För EXE-filer (kräver Firebase Blaze plan):
EXE-filer blockeras av Firebase Spark plan. Använd GitHub Releases istället eller uppgradera till Blaze.

## Filnamn som appen förväntar sig:
- `BettingTracker_x64.msi` - MSI installer för Windows x64
- `BettingTracker_x64.exe` - EXE installer för Windows x64

## Aktivera nedladdningsknappar:
När du lagt till en giltig installationsfil, ändra i `src/components/common/DownloadAppButton.tsx` och `src/components/common/DownloadSection.tsx` för att aktivera knapparna igen.
