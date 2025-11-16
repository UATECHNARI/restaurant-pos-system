# ============================================
# Pizza POS System - Запуск всіх серверів
# ============================================

Write-Host "🍕 Запуск Pizza POS System..." -ForegroundColor Cyan
Write-Host ""

# Перевірити чи Node.js встановлений
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js версія: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не знайдено! Встановіть Node.js 18+ з https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Перевірити чи MySQL запущений
$mysqlRunning = Get-Process | Where-Object { $_.ProcessName -like "*mysql*" }
if ($mysqlRunning) {
    Write-Host "✅ MySQL запущений" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL може бути не запущений" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Запустити Backend
Write-Host ""
Write-Host "🚀 Запуск Backend (порт 3001)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\backend'; Write-Host '═════ BACKEND SERVER ═════' -ForegroundColor Cyan; npm run dev"

Write-Host "   ⏳ Очікування запуску backend (3 секунди)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Запустити Frontend
Write-Host ""
Write-Host "🚀 Запуск Frontend (порт 5173)..." -ForegroundColor Magenta  
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot'; Write-Host '═════ FRONTEND SERVER ═════' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Обидва сервери запущені!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3001" -ForegroundColor White
Write-Host "   API:       http://localhost:3001/api" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Тестові облікові записи (пароль: password123):" -ForegroundColor Cyan
Write-Host "   admin@pizza.com    - Адміністратор" -ForegroundColor White
Write-Host "   cashier@pizza.com  - Касир" -ForegroundColor White
Write-Host "   kitchen@pizza.com  - Кухня" -ForegroundColor White
Write-Host "   bar@pizza.com      - Бар" -ForegroundColor White
Write-Host ""
Write-Host "💡 Подальші дії:" -ForegroundColor Yellow
Write-Host "   1. Відкрийте браузер на http://localhost:5173" -ForegroundColor Gray
Write-Host "   2. Натисніть на роль для швидкого входу" -ForegroundColor Gray
Write-Host "   3. Користуйтесь системою!" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Щоб зупинити сервери - закрийте відкриті вікна PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Натисніть будь-яку клавішу для виходу з цього вікна..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




