# test-system.ps1
# Швидка перевірка системи

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ПЕРЕВІРКА СИСТЕМИ PIZZA POS         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Перевірка 1: Backend
Write-Host "1️⃣  Перевірка Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "OK") {
        Write-Host "   ✅ Backend працює!" -ForegroundColor Green
        Write-Host "      Timestamp: $($response.timestamp)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Backend повернув незрозумілу відповідь" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Backend НЕ працює!" -ForegroundColor Red
    Write-Host "      Запустіть: cd D:\Work\Pizza\backend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Перевірка 2: Frontend
Write-Host "2️⃣  Перевірка Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend працює!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend повернув статус: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Frontend НЕ працює!" -ForegroundColor Red
    Write-Host "      Запустіть: cd D:\Work\Pizza; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Перевірка 3: База даних (через backend)
Write-Host "3️⃣  Перевірка бази даних..." -ForegroundColor Yellow
try {
    $body = @{email="admin@pizza.com"; password="password123"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ База даних працює та користувачі створені!" -ForegroundColor Green
    Write-Host "      User: $($response.user.email)" -ForegroundColor Gray
    Write-Host "      Role: $($response.user.role)" -ForegroundColor Gray
} catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*Server error*") {
        Write-Host "   ❌ Користувачі не створені в базі!" -ForegroundColor Red
        Write-Host "      Виконайте: cd D:\Work\Pizza\backend; npm run init:users" -ForegroundColor Yellow
    } elseif ($errorMessage -like "*Invalid credentials*") {
        Write-Host "   ⚠️  Користувачі існують, але пароль неправильний" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Помилка підключення до бази даних" -ForegroundColor Red
        Write-Host "      Помилка: $errorMessage" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Інструкції
Write-Host "📋 ЩО РОБИТИ ДАЛІ:" -ForegroundColor White
Write-Host ""

$backendOK = $false
$frontendOK = $false

try {
    $null = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendOK = $true
} catch {}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    $frontendOK = $true
} catch {}

if (-not $backendOK) {
    Write-Host "   1. Запустити Backend:" -ForegroundColor Yellow
    Write-Host "      cd D:\Work\Pizza\backend" -ForegroundColor Gray
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
}

if (-not $frontendOK) {
    Write-Host "   2. Запустити Frontend:" -ForegroundColor Yellow
    Write-Host "      cd D:\Work\Pizza" -ForegroundColor Gray
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
}

if ($backendOK -and $frontendOK) {
    Write-Host "   ✅ Всі сервіси працюють!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📱 Відкрийте в браузері:" -ForegroundColor White
    Write-Host "      http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   🔧 Якщо кнопки все ще не активні:" -ForegroundColor White
    Write-Host "      1. Натисніть F12 (DevTools)" -ForegroundColor Gray
    Write-Host "      2. Перейдіть на вкладку Console" -ForegroundColor Gray
    Write-Host "      3. Перезавантажте сторінку (Ctrl+Shift+R)" -ForegroundColor Gray
    Write-Host "      4. Подивіться чи є червоні помилки" -ForegroundColor Gray
    Write-Host "      5. Скопіюйте текст помилки і відправте мені" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📄 Детальна діагностика: ДІАГНОСТИКА.txt" -ForegroundColor White
Write-Host ""




