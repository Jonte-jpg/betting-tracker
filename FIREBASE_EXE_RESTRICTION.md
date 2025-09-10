# Firebase Hosting EXE-fil Problem - Lösningar

## 🚨 PROBLEM: Firebase Spark Plan blockerar EXE-filer

Firebase Hosting's gratis plan (Spark) tillåter INTE .exe-filer av säkerhetsskäl.

Felmeddelande: `Executable files are forbidden on the Spark billing plan`

## ✅ LÖSNINGAR

### Option 1: Använd MSI istället (REKOMMENDERAT för gratis plan)
```powershell
# Lägg bara MSI-filer i public/downloads/
Copy-Item "path\to\BettingTracker_x64.msi" "public\downloads\"

# Deploy
npm run build
firebase deploy
```

### Option 2: Uppgradera till Firebase Blaze Plan
- Kostar från $0/månad (pay-as-you-go)
- Tillåter EXE-filer
- Hantera i Firebase Console → Upgrade

### Option 3: Hybrid-lösning med GitHub Releases
```yaml
# .github/workflows/release.yml
name: Release Desktop App
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Tauri
        run: |
          npm install
          npm run tauri:build
      - name: Upload Release Assets
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: src-tauri/target/release/bundle/msi/BettingTracker_x64.msi
          asset_name: BettingTracker_x64.msi
          asset_content_type: application/octet-stream
```

### Option 4: Extern hosting för EXE
- AWS S3
- Google Cloud Storage
- Egen server
- DigitalOcean Spaces

## 🔧 UPPDATERA KNAPPAR

UI-komponenter behöver uppdateras för att hantera detta:

```tsx
// Uppdatera DownloadAppButton för MSI-först
export function DownloadAppButton() {
  // Kolla efter MSI först, sedan EXE från extern källa
  const [href, setHref] = useState<string | null>(null)
  
  useEffect(() => {
    // Check Firebase MSI first
    fetch('/downloads/BettingTracker_x64.msi', { method: 'HEAD' })
      .then(res => {
        if (res.ok) setHref('/downloads/BettingTracker_x64.msi')
        else {
          // Fallback to GitHub Releases EXE
          setHref('https://github.com/USER/REPO/releases/latest/download/BettingTracker_x64.exe')
        }
      })
  }, [])
  
  // ... rest of component
}
```

## 🎯 REKOMMENDATION

**För nu:** Använd MSI-filer på Firebase Hosting (gratis)
**För framtiden:** GitHub Releases för både MSI + EXE (gratis och robust)

MSI-filer fungerar bra på Windows och behöver inte EXE-funktionalitet.
