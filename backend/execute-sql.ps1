# PowerShell скрипт для виконання SQL файлу
# Використання: .\execute-sql.ps1 add-multi-tenancy.sql

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

Write-Host "🔄 Виконання SQL скрипту: $SqlFile" -ForegroundColor Cyan

# Перевірити чи файл існує
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ Помилка: Файл $SqlFile не знайдено!" -ForegroundColor Red
    exit 1
}

# Запитати пароль MySQL
$password = Read-Host "Введіть пароль MySQL для користувача root" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Виконати SQL скрипт
$sqlContent = Get-Content $SqlFile -Raw
$sqlContent | mysql -u root -p$plainPassword bar_kitchen_pos

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SQL скрипт виконано успішно!" -ForegroundColor Green
} else {
    Write-Host "❌ Помилка при виконанні SQL скрипту!" -ForegroundColor Red
}


