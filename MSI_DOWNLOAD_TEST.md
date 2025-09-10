# MSI Download Test Guide

## Problem: MSI nedladdning ger HTML istället för binärfil

Firebase Hosting's rewrite-regler fångar alla requests inklusive `/downloads/` och returnerar HTML.

## Lösning: Testbar MSI med rätt innehåll

Vi behöver skapa en RIKTIG MSI-fil för testning, inte bara en textfil.

### Alternativ 1: Skapa minimal MSI med WiX Toolset
```powershell
# Installera WiX Toolset
winget install --id WiXToolset.WiX -e

# Skapa minimal MSI (kommande steg)
```

### Alternativ 2: Använda existerande MSI som test
```powershell
# Kopiera en existerande MSI för testning
Copy-Item "C:\Path\To\Any\Existing\Application.msi" "public\downloads\BettingTracker_x64.msi"
```

### Alternativ 3: Extern hosting
```yaml
# GitHub Releases för MSI hosting
- uses: actions/upload-release-asset@v1
  with:
    upload_url: ${{ steps.create_release.outputs.upload_url }}
    asset_path: BettingTracker_x64.msi
    asset_name: BettingTracker_x64.msi
```

## Status
- Firebase rewrite-problemet kvarstår
- MSI-fil behöver vara riktig binärfil
- Headers är korrekt konfigurerade
