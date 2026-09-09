# YDS Soru Filtreleme - Mağaza Derleme Scripti (Android APK + Google Play AAB & iOS Sync)
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " YDS Soru - Mağaza Paketleri ve Senkronizasyon Başladı  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

# 1. Ortam Değişkenleri
$env:JAVA_HOME = "$env:LOCALAPPDATA\Programs\jdk-17"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:LOCALAPPDATA\Programs\gradle-8.7\bin;$env:Path"

# 2. Web Varlıklarını Güncelle
Write-Host "[1/4] Web varlıkları 'www/' dizinine kopyalanıyor..." -ForegroundColor Yellow
$webFiles = @('index.html', 'style.css', 'app.js', 'ad-service.js', 'questions.js', 'practice_questions.js', 'dictionary.js', 'pdf-parser.js', 'manifest.json', 'icon-192.png', 'icon-512.png')
foreach ($file in $webFiles) {
    Copy-Item -Path (Join-Path $root $file) -Destination (Join-Path $root "www") -Force
}

# 3. Capacitor Senkronizasyonu (iOS ve Android)
Write-Host "[2/4] Capacitor platformları (iOS & Android) eşitleniyor..." -ForegroundColor Yellow
npx cap sync

# 4. Android APK ve Google Play AAB Derleme
Write-Host "[3/4] Android Studio projesinden paketler üretiliyor..." -ForegroundColor Yellow
Push-Location (Join-Path $root "android")
try {
    # Debug APK
    Write-Host "  -> Test APK derleniyor (assembleDebug)..." -ForegroundColor Gray
    .\gradlew.bat assembleDebug --no-daemon
    
    # Release AAB (Google Play Store Paketi)
    Write-Host "  -> Google Play AAB derleniyor (bundleRelease)..." -ForegroundColor Gray
    .\gradlew.bat bundleRelease --no-daemon
} finally {
    Pop-Location
}

# 5. Çıktıları Kök Dizine Kopyala
Write-Host "[4/4] Çıktılar düzenleniyor..." -ForegroundColor Yellow
$apkSrc = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
$aabSrc = Join-Path $root "android\app\build\outputs\bundle\release\app-release.aab"

$apkDest = Join-Path $root "yds-soru-test.apk"
$aabDest = Join-Path $root "yds-soru-googleplay.aab"

if (Test-Path $apkSrc) {
    Copy-Item -Path $apkSrc -Destination $apkDest -Force
    $apkSize = [math]::Round(((Get-Item $apkDest).Length / 1MB), 2)
    Write-Host "  [OK] Test APK: $apkDest ($apkSize MB)" -ForegroundColor Green
}

if (Test-Path $aabSrc) {
    Copy-Item -Path $aabSrc -Destination $aabDest -Force
    $aabSize = [math]::Round(((Get-Item $aabDest).Length / 1MB), 2)
    Write-Host "  [OK] Google Play AAB: $aabDest ($aabSize MB)" -ForegroundColor Green
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " [BAŞARILI] Tüm Mağaza Hazırlıkları Tamamlandı!" -ForegroundColor Green
Write-Host " - Android (Google Play): $aabDest (Google Play Console için)" -ForegroundColor Green
Write-Host " - Android (Test APK): $apkDest (Telefonunuza kurmak için)" -ForegroundColor Green
Write-Host " - iOS (App Store): ios\App\App.xcworkspace (Xcode ile açmak için)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
