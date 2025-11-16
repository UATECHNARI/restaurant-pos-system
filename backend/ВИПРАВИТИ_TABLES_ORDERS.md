# 🔧 ВИПРАВИТИ: Додати client_id до tables та orders

## ❌ Помилка:

```
Unknown column 'client_id' in 'where clause'
- tables: WHERE client_id = 1
- orders: WHERE o.client_id = 1
```

**Причина:** Колонка `client_id` не додана до таблиць `tables` та `orders`.

---

## ✅ Рішення:

### Варіант 1: Автоматичний скрипт (рекомендовано)

```powershell
cd D:\Work\Pizza\backend

# Виконати скрипт, який додасть client_id до ВСІХ таблиць
Get-Content add-client-id-to-all-tables.sql | mysql -u root -p bar_kitchen_pos
```

---

### Варіант 2: Виконати вручну в MySQL

```sql
USE bar_kitchen_pos;

-- 1. Додати client_id до tables
ALTER TABLE tables 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 2. Додати client_id до orders
ALTER TABLE orders 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 3. Додати client_id до order_items (якщо потрібно)
ALTER TABLE order_items 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
```

**Якщо помилка "Duplicate column"** - ігноруйте, колонка вже існує.

**Якщо помилка "Table 'clients' doesn't exist"** - спочатку створити таблицю `clients`:

```sql
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔍 Перевірка:

### Перевірити структуру таблиць:

```sql
USE bar_kitchen_pos;

DESCRIBE tables;
DESCRIBE orders;
DESCRIBE order_items;
```

**Очікуваний результат:**

**tables:**
```
+-----------+---------+------+-----+---------+----------------+
| Field     | Type    | Null | Key | Default | Extra          |
+-----------+---------+------+-----+---------+----------------+
| id        | int     | NO   | PRI | NULL    | auto_increment |
| client_id | int     | NO   | MUL | NULL    |                |  <- Має бути
| number    | int     | NO   | MUL | NULL    |                |
| ...       | ...     | ...  | ... | ...     | ...            |
+-----------+---------+------+-----+---------+----------------+
```

**orders:**
```
+-----------+---------+------+-----+---------+----------------+
| Field     | Type    | Null | Key | Default | Extra          |
+-----------+---------+------+-----+---------+----------------+
| id        | int     | NO   | PRI | NULL    | auto_increment |
| client_id | int     | NO   | MUL | NULL    |                |  <- Має бути
| ...       | ...     | ...  | ... | ...     | ...            |
+-----------+---------+------+-----+---------+----------------+
```

---

## 🚀 Після виконання SQL:

### 1. Оновити існуючі дані (якщо є):

```sql
USE bar_kitchen_pos;

-- Оновити існуючі столи (призначити client_id = 1)
UPDATE tables SET client_id = 1 WHERE client_id IS NULL OR client_id = 0;

-- Оновити існуючі замовлення (призначити client_id = 1)
UPDATE orders SET client_id = 1 WHERE client_id IS NULL OR client_id = 0;

-- Оновити існуючі order_items (через orders)
UPDATE order_items oi
INNER JOIN orders o ON oi.order_id = o.id
SET oi.client_id = o.client_id
WHERE oi.client_id IS NULL OR oi.client_id = 0;
```

### 2. Перезапустити backend:

```powershell
cd D:\Work\Pizza\backend
npm run dev
```

### 3. Перелогінитись:

1. Вийти з системи
2. Зайти знову
3. Перевірити чи працює

---

## ✅ Після виправлення:

- ✅ `GET /api/tables` - має працювати
- ✅ `GET /api/orders` - має працювати
- ✅ `GET /api/products` - має працювати
- ✅ Всі запити повертають `200 OK` замість `500 Internal Server Error`

---

**Створено:** `add-client-id-to-all-tables.sql` - автоматичний скрипт для додавання `client_id` до всіх таблиць.


