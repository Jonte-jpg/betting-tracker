# Guide: Lägga till installationsfiler för BettingTracker

## 📁 Var ska filerna placeras?

Lägg dina installationsfiler i mappen:
```
public/downloads/
```

## 📝 Filnamn som appen förväntar sig:

- **MSI-fil (rekommenderat):** `BettingTracker_x64.msi`
- **EXE-fil:** `BettingTracker_x64.exe`

## 🔧 Steg för att lägga till filer:

### Alternativ 1: Firebase Hosting (MSI endast)

```powershell
# 1. Kopiera din MSI-fil till downloads-mappen
Copy-Item "C:\path\to\din\BettingTracker_x64.msi" "public\downloads\"

# 2. Bygg och deploya
npm run build
firebase deploy

# 3. Testa nedladdning
# Gå till appen → Inställningar → Du bör se en "Ladda ner MSI" knapp
```

### Alternativ 2: GitHub Releases (både MSI och EXE)

```powershell
# 1. Committa alla ändringar
git add -A
git commit -m "Redo för desktop release"
git push

# 2. Skapa en release tag
git tag v1.0.0
git push origin v1.0.0

# 3. GitHub Actions kommer automatiskt att bygga och skapa en release
# med installationsfilerna tillgängliga för nedladdning
```

## 🎯 Fördelar med varje alternativ:

### MSI + Firebase Hosting:
- ✅ Gratis hosting
- ✅ Automatisk integration med appen
- ✅ HEAD-kontroll för filexistens
- ❌ Endast MSI-filer (ej EXE)

### GitHub Releases:
- ✅ Både MSI och EXE stöds
- ✅ Automatisk byggprocess
- ✅ Versionhantering
- ✅ Ingen begränsning på filtyper

## 🔍 Hur vet jag att det fungerar?

1. **I appen:** Gå till Inställningar - du bör se nedladdningsknappar
2. **I header:** En "Ladda ner MSI/EXE" knapp visas i toppraden
3. **HEAD-kontroll:** Appen gör automatiskt HEAD-requests för att kolla filexistens

## 🚨 Felsökning:

### "Inga installationsfiler hittades"
- Kontrollera att filnamnet är exakt: `BettingTracker_x64.msi` eller `BettingTracker_x64.exe`
- Kontrollera att filen ligger i `public/downloads/`
- Kör `firebase deploy` efter att ha lagt till filen

### "Filen är skadad"
- EXE-filer fungerar inte med Firebase Spark plan - använd MSI istället
- Kontrollera att filen inte är korrupt lokalt

### Knapparna visas inte
- Öppna DevTools → Network tab → kolla om HEAD-request till `/downloads/BettingTracker_x64.msi` returnerar 200
- Content-Type ska vara `application/octet-stream` eller liknande binär typ

## 📚 Relaterade filer:

- `FIREBASE_EXE_RESTRICTION.md` - Detaljer om Firebase begränsningar
- `MSI_DOWNLOAD_TEST.md` - Testinstruktioner för MSI
- `.github/workflows/release.yml` - GitHub Actions för automatisk release
