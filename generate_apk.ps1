# YDS Soru Filtreleme - Otomatik APK Derleme Scripti (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  YDS Soru APK Mobil Uygulaması Derleniyor   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$androidDir = Join-Path $scriptDir "android-app"
$assetsDir = Join-Path $androidDir "app\src\main\assets\www"

# 1. Ortam Değişkenlerini Tanımla
$env:JAVA_HOME = "$env:LOCALAPPDATA\Programs\jdk-17"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:LOCALAPPDATA\Programs\gradle-8.7\bin;$env:Path"

Write-Host "[1/4] Java ve Android ortamı kontrol ediliyor..." -ForegroundColor Yellow
if (!(Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
    Write-Error "JDK 17 bulunamadı: $env:JAVA_HOME"
}
if (!(Test-Path "$env:ANDROID_HOME")) {
    Write-Error "Android SDK bulunamadı: $env:ANDROID_HOME"
}

# 2. Web Varlıklarını Güncelle
Write-Host "[2/4] Güncel web varlıkları Android assets dizinine kopyalanıyor..." -ForegroundColor Yellow
$webFiles = @('index.html', 'style.css', 'app.js', 'dictionary.js', 'questions.js', 'pdf-parser.js', 'manifest.json', 'icon-192.png', 'icon-512.png')
foreach ($file in $webFiles) {
    $src = Join-Path $scriptDir $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $assetsDir -Force
    }
}

# 3. Gradle ile APK Derle
Write-Host "[3/4] Gradle assembleDebug derlemesi başlatılıyor..." -ForegroundColor Yellow
Push-Location $androidDir
try {
    $gradleBat = Join-Path $androidDir "gradlew.bat"
    if (!(Test-Path $gradleBat)) {
        $gradleBat = "$env:LOCALAPPDATA\Programs\gradle-8.7\bin\gradle.bat"
    }
    & $gradleBat assembleDebug --no-daemon
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Gradle derleme hatası oluştu. Çıkış kodu: $LASTEXITCODE"
    }
} finally {
    Pop-Location
}

# 4. APK Çıktısını Kök Dizine Kopyala
Write-Host "[4/4] APK dosyası hazırlanıyor..." -ForegroundColor Yellow
$builtApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
$targetApk = Join-Path $scriptDir "yds-soru-v1.0.apk"

if (Test-Path $builtApk) {
    Copy-Item -Path $builtApk -Destination $targetApk -Force
    $sizeMb = [math]::Round(((Get-Item $targetApk).Length / 1MB), 2)
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host " [BAŞARILI] APK Başarıyla Üretildi!" -ForegroundColor Green
    Write-Host " Dosya: $targetApk ($sizeMb MB)" -ForegroundColor Green
    Write-Host " Bu APK dosyasını Android telefonunuza veya" -ForegroundColor Green
    Write-Host " emülatörünüze yükleyip hemen kullanabilirsiniz." -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
} else {
    Write-Error "Beklenen APK çıktısı bulunamadı: $builtApk"
}
