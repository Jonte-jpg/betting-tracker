# Installation och felsökning - BettingTracker Desktop

## Problem: EXE öppnas inte efter installation

### Steg 1: Kontrollera installationsstatus
```powershell
# Kontrollera om programmet finns i Program Files
Get-ChildItem "C:\Program Files\BettingTracker" -ErrorAction SilentlyContinue
Get-ChildItem "C:\Program Files (x86)\BettingTracker" -ErrorAction SilentlyContinue

# Kontrollera installerade program
Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*BettingTracker*"}
```

### Steg 2: Hitta den installerade EXE-filen
```powershell
# Sök efter BettingTracker.exe
Get-ChildItem -Path "C:\" -Recurse -Name "*BettingTracker*.exe" -ErrorAction SilentlyContinue | Select-Object -First 10

# Kontrollera AppData för användarinstallationer
Get-ChildItem "$env:LOCALAPPDATA\Programs" -Recurse -Name "*BettingTracker*.exe" -ErrorAction SilentlyContinue
```

### Steg 3: Testa manuell start
```powershell
# Om du hittar EXE-filen, testa att köra den direkt
# Ersätt sökvägen med den faktiska sökvägen
& "C:\Program Files\BettingTracker\BettingTracker.exe"

# Eller från kommandorad för att se felmeddelanden
cmd /c "C:\Program Files\BettingTracker\BettingTracker.exe"
```

### Steg 4: Kontrollera WebView2 Runtime (KRITISKT för Tauri-appar)
```powershell
# Kontrollera om WebView2 Runtime är installerat
Get-AppxPackage | Where-Object {$_.Name -like "*WebView*"}

# Kontrollera registry för WebView2
Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -ErrorAction SilentlyContinue
```

### Steg 5: Installera WebView2 Runtime (om det saknas)
```powershell
# Ladda ner och installera WebView2 Runtime
winget install --id Microsoft.EdgeWebView2Runtime -e

# Alternativt, ladda ner manuellt från:
# https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

### Steg 6: Kontrollera Windows Defender/Säkerhet
```powershell
# Kontrollera om filen blockeras av Windows Defender
Get-MpThreatDetection | Where-Object {$_.Resources -like "*BettingTracker*"}

# Avblockera filen om den blockeras
Unblock-File "C:\Users\$env:USERNAME\Downloads\BettingTracker_x64.exe"
```

### Steg 7: Kör som administratör
```powershell
# Prova att köra installationen som administratör
Start-Process -FilePath "C:\Users\$env:USERNAME\Downloads\BettingTracker_x64.exe" -Verb RunAs
```

### Steg 8: Kontrollera genvägar och Start-menyn
```powershell
# Kontrollera Start-menyn
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs" -Recurse -Name "*BettingTracker*"
Get-ChildItem "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs" -Recurse -Name "*BettingTracker*"

# Kontrollera Desktop genvägar
Get-ChildItem "$env:USERPROFILE\Desktop" -Name "*BettingTracker*"
```

## Vanliga lösningar

### Problem: "Programmet kunde inte startas"
**Lösning:** Installera WebView2 Runtime
```powershell
winget install --id Microsoft.EdgeWebView2Runtime -e
```

### Problem: "Windows skyddade din dator"
**Lösning:** Klicka "Mer info" → "Kör ändå", eller avblockera filen:
```powershell
Unblock-File "C:\Users\$env:USERNAME\Downloads\BettingTracker_x64.exe"
```

### Problem: Installation verkar lyckas men ingen EXE hittas
**Lösning:** Kontrollera om det är en portable installation:
```powershell
# Kontrollera Downloads-mappen för utpackade filer
Get-ChildItem "$env:USERPROFILE\Downloads" -Recurse -Name "*BettingTracker*"
```

### Problem: EXE startar men stängs direkt
**Lösning:** Kör från kommandotolken för att se felmeddelanden:
```cmd
cd "C:\Program Files\BettingTracker"
BettingTracker.exe
```

## Kontrollera installationslogg (NSIS)
Om det är en NSIS-installateur, kontrollera:
```powershell
# NSIS skriver ofta till TEMP
Get-ChildItem $env:TEMP -Name "*install*" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

## Alternativ installation
Om EXE fortsätter krångla, prova:
1. Ladda ner MSI-versionen istället
2. Installera som administratör
3. Kontrollera att alla Windows Updates är installerade

## Kontakt och support
Om inget av ovanstående hjälper:
1. Kör installationen från PowerShell som admin och skicka eventuella felmeddelanden
2. Kontrollera Windows Event Viewer för applikationsfel
3. Prova att installera på en annan Windows-dator för att isolera problemet
