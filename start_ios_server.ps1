# YDS Soru - iPhone Yerel Canlı Önizleme Sunucusu
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$www = Join-Path $root "www"

# Yerel Wi-Fi IP Adresini Bul
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { ($_.IPAddress -like "192.168*" -or $_.IPAddress -like "10.*") -and $_.InterfaceAlias -notmatch "vEthernet|Loopback|Virtual" } | Select-Object -First 1).IPAddress
if (-not $localIp) { 
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress 
}
if (-not $localIp) { $localIp = "127.0.0.1" }
$port = 8080

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       YDS Soru - iPhone Canlı Test ve Önizleme Sunucusu    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. iPhone cihazınızın bu bilgisayarla AYNI Wi-Fi ağına bağlı olduğundan emin olun." -ForegroundColor Yellow
Write-Host "2. iPhone'unuzda Safari tarayıcısını açın ve şu adresi yazın:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     http://${localIp}:${port}" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "3. Safari'nin altındaki 'Paylaş' (Kare ve yukarı ok) ikonuna tıklayın." -ForegroundColor Yellow
Write-Host "4. 'Ana Ekrana Ekle' (Add to Home Screen) butonuna basın." -ForegroundColor Yellow
Write-Host "5. Tebrikler! Uygulama iPhone'unuzda tam ekran ve offline çalışacaktır." -ForegroundColor Green
Write-Host ""
Write-Host "Sunucuyu durdurmak için bu ekranda Ctrl + C tuşlarına basabilirsiniz." -ForegroundColor Gray
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan

Set-Location $www
python -m http.server $port --bind 0.0.0.0
