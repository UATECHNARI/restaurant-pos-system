# 📋 Виконання SQL скрипту в PowerShell

## ❌ Проблема:

PowerShell не підтримує `<` для перенаправлення вводу (як bash).

---

## ✅ РІШЕННЯ (3 варіанти):

### Варіант 1: Використати Get-Content (найпростіший)

```powershell
cd D:\Work\Pizza\backend

# Ввести пароль при запиті
Get-Content add-multi-tenancy.sql | mysql -u root -p bar_kitchen_pos
```

Або з конкретним файлом:
```powershell
Get-Content create-clients-table-only.sql | mysql -u root -p bar_kitchen_pos
```

---

### Варіант 2: Використати PowerShell скрипт

```powershell
cd D:\Work\Pizza\backend

# Виконати скрипт (запитає пароль)
.\execute-sql.ps1 add-multi-tenancy.sql
```

---

### Варіант 3: MySQL Workbench (найпростіший візуально)

1. Відкрити **MySQL Workbench**
2. Підключитися до бази даних `bar_kitchen_pos`
3. **File** → **Open SQL Script**
4. Виберіть файл `add-multi-tenancy.sql` або `create-clients-table-only.sql`
5. Натисніть **F9** (Execute) або кнопку **⚡ Execute**

---

## 📝 КРОК ЗА КРОКОМ:

### 1️⃣ Виконати SQL скрипт:

**PowerShell:**
```powershell
cd D:\Work\Pizza\backend
Get-Content add-multi-tenancy.sql | mysql -u root -p bar_kitchen_pos
```

**Або швидкий (тільки clients):**
```powershell
Get-Content create-clients-table-only.sql | mysql -u root -p bar_kitchen_pos
```

### 2️⃣ Мігрувати існуючих користувачів:

```powershell
npm run migrate:users
```

### 3️⃣ Перезапустити backend:

```powershell
# Зупинити поточний процес (Ctrl+C) та запустити знову
npm run dev
```

### 4️⃣ Перелогінитись в системі

---

## 🔍 ПЕРЕВІРКА:

### Перевірити чи таблиця створена:

```powershell
mysql -u root -p bar_kitchen_pos -e "SHOW TABLES LIKE 'clients';"
```

Або в MySQL:
```sql
USE bar_kitchen_pos;
SHOW TABLES LIKE 'clients';
DESCRIBE clients;
DESCRIBE users;
```

---

## ⚠️ ЯКЩО ПОМИЛКА:

### Помилка: "Access denied"

```powershell
# Спробуйте ввести пароль окремо
mysql -u root -p bar_kitchen_pos

# Потім в MySQL:
source D:/Work/Pizza/backend/add-multi-tenancy.sql;
```

### Помилка: "Unknown database"

```sql
-- Спочатку створити базу даних (якщо не існує)
CREATE DATABASE IF NOT EXISTS bar_kitchen_pos;
USE bar_kitchen_pos;
-- Потім виконати скрипт
```

---

## ✅ ПІСЛЯ УСПІШНОГО ВИКОНАННЯ:

1. ✅ Таблиця `clients` створена
2. ✅ Колонка `client_id` додана в `users`
3. ✅ Міграція виконана (`npm run migrate:users`)
4. ✅ Backend перезапущено
5. ✅ Реєстрація працює
6. ✅ Товари та столи додаються

---

**Команда для PowerShell:**
```powershell
Get-Content add-multi-tenancy.sql | mysql -u root -p bar_kitchen_pos
```


