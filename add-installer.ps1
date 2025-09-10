# PowerShell script för att lägga till installationsfiler i BettingTracker

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Deploy
)

Write-Host "🔧 BettingTracker Installation File Setup" -ForegroundColor Green

# Kontrollera att projektet finns
if (-not (Test-Path "package.json")) {
    Write-Error "❌ Inte i rätt mapp! Kör detta script från BettingTracker-projektets rot."
    exit 1
}

# Kontrollera att källfilen finns
if (-not (Test-Path $FilePath)) {
    Write-Error "❌ Filen '$FilePath' hittades inte!"
    exit 1
}

# Skapa downloads-mapp om den inte finns
$downloadsDir = "public\downloads"
if (-not (Test-Path $downloadsDir)) {
    New-Item -ItemType Directory -Path $downloadsDir -Force | Out-Null
    Write-Host "📁 Skapade mapp: $downloadsDir" -ForegroundColor Yellow
}

# Identifiera filtyp och målnamn
$fileInfo = Get-Item $FilePath
$targetName = $null

if ($fileInfo.Extension -eq ".msi") {
    $targetName = "BettingTracker_x64.msi"
    Write-Host "📦 Detekterade MSI-fil (kompatibel med Firebase gratis plan)" -ForegroundColor Green
} elseif ($fileInfo.Extension -eq ".exe") {
    $targetName = "BettingTracker_x64.exe"
    Write-Host "⚠️  Detekterade EXE-fil (kräver Firebase Blaze plan eller GitHub Releases)" -ForegroundColor Yellow
} else {
    Write-Error "❌ Ostödd filtyp: $($fileInfo.Extension). Endast .msi och .exe stöds."
    exit 1
}

$targetPath = Join-Path $downloadsDir $targetName

# Kopiera filen
try {
    Copy-Item $FilePath $targetPath -Force
    Write-Host "✅ Kopierade $($fileInfo.Name) → $targetName" -ForegroundColor Green
    
    # Visa filstorlek
    $size = [math]::Round((Get-Item $targetPath).Length / 1MB, 2)
    Write-Host "📊 Filstorlek: $size MB" -ForegroundColor Cyan
    
} catch {
    Write-Error "❌ Kunde inte kopiera filen: $($_.Exception.Message)"
    exit 1
}

# Bygg och deploy om requested
if ($Deploy) {
    Write-Host "🔨 Bygger applikationen..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🚀 Deployer till Firebase..." -ForegroundColor Yellow
        firebase deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deploy lyckades! Installationsfilen är nu tillgänglig." -ForegroundColor Green
        } else {
            Write-Error "❌ Deploy misslyckades!"
        }
    } else {
        Write-Error "❌ Build misslyckades!"
    }
}

Write-Host ""
Write-Host "🎯 Nästa steg:" -ForegroundColor Cyan
Write-Host "1. Kontrollera att filen finns: $targetPath"
if (-not $Deploy) {
    Write-Host "2. Kör 'npm run build' och 'firebase deploy' för att pusha ändringarna"
}
Write-Host "3. Gå till appen → Inställningar för att se nedladdningsknappen"
Write-Host ""

if ($fileInfo.Extension -eq ".exe") {
    Write-Host "⚠️  OBS: EXE-filer blockeras av Firebase Spark plan!" -ForegroundColor Red
    Write-Host "💡 Alternativ:" -ForegroundColor Yellow
    Write-Host "   - Uppgradera till Firebase Blaze plan"
    Write-Host "   - Använd GitHub Releases (se .github/workflows/release.yml)"
    Write-Host "   - Konvertera till MSI-format"
}
