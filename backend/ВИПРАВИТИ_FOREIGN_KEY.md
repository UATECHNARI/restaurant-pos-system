# 🔧 ВИПРАВИТИ: Помилка Foreign Key для products

## ❌ Помилка:

```
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
(`bar_kitchen_pos`.`#sql-190c_6c`, CONSTRAINT `fk_products_client` FOREIGN KEY (`client_id`) 
REFERENCES `clients` (`id`) ON DELETE CASCADE)
```

**Причина:** Існуючі записи в `products` мають `client_id`, який не відповідає жодному `id` в таблиці `clients` (наприклад, `NULL` або неіснуючий ID).

---

## ✅ Рішення (2 кроки):

### Крок 1: Оновити існуючі дані

```powershell
cd D:\Work\Pizza\backend

# Спочатку оновити всі існуючі дані
Get-Content fix-existing-data.sql | mysql -u root -p bar_kitchen_pos
```

Це встановить `client_id = 1` для всіх записів, де `client_id` NULL або невалідний.

---

### Крок 2: Додати foreign keys

```powershell
# Потім додати foreign keys
Get-Content add-foreign-keys-only.sql | mysql -u root -p bar_kitchen_pos
```

---

## 🔍 Або виконати вручну в MySQL:

### Крок 1: Перевірити клієнтів

```sql
USE bar_kitchen_pos;
SELECT * FROM clients;
```

**Очікуваний результат:**
```
+----+---------------------+-------------------------+-------+---------+
| id | name                | email                   | ...   | status  |
+----+---------------------+-------------------------+-------+---------+
|  1 | admin               | admin@pizza.com         | ...   | active  |
|  2 | ua.technari         | ua.technari@gmail.com   | ...   | active  |
+----+---------------------+-------------------------+-------+---------+
```

### Крок 2: Оновити products

```sql
-- Встановити client_id = 1 для всіх products
UPDATE products 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);
```

### Крок 3: Оновити tables

```sql
-- Встановити client_id = 1 для всіх tables
UPDATE tables 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);
```

### Крок 4: Оновити orders

```sql
-- Встановити client_id = 1 для всіх orders
UPDATE orders 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);
```

### Крок 5: Оновити order_items

```sql
-- Оновити order_items через orders
UPDATE order_items oi
INNER JOIN orders o ON oi.order_id = o.id
SET oi.client_id = o.client_id
WHERE oi.client_id IS NULL 
   OR oi.client_id = 0 
   OR oi.client_id NOT IN (SELECT id FROM clients);
```

### Крок 6: Додати foreign keys

```sql
-- Додати foreign key до products
ALTER TABLE products 
ADD CONSTRAINT fk_products_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Додати foreign key до tables
ALTER TABLE tables 
ADD CONSTRAINT fk_tables_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Додати foreign key до orders
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Додати foreign key до order_items
ALTER TABLE order_items 
ADD CONSTRAINT fk_order_items_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
```

**Якщо помилка "Duplicate foreign key"** - ігноруйте, foreign key вже існує.

---

## 🔍 Перевірка:

### Перевірити дані:

```sql
USE bar_kitchen_pos;

-- Перевірити products
SELECT id, name, client_id FROM products;
-- Всі записи мають мати client_id = 1 (або інший валідний ID)

-- Перевірити tables
SELECT id, number, client_id FROM tables;
-- Всі записи мають мати client_id = 1

-- Перевірити orders
SELECT id, client_id, created_at FROM orders;
-- Всі записи мають мати client_id = 1
```

### Перевірити foreign keys:

```sql
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
AND REFERENCED_TABLE_NAME = 'clients';
```

**Очікуваний результат:**
```
+-------------+---------------------+-------------+-----------------------+------------------------+
| TABLE_NAME  | CONSTRAINT_NAME     | COLUMN_NAME | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+-------------+---------------------+-------------+-----------------------+------------------------+
| users       | fk_users_client     | client_id   | clients               | id                     |
| products    | fk_products_client  | client_id   | clients               | id                     |
| tables      | fk_tables_client    | client_id   | clients               | id                     |
| orders      | fk_orders_client    | client_id   | clients               | id                     |
| order_items | fk_order_items_client| client_id | clients               | id                     |
+-------------+---------------------+-------------+-----------------------+------------------------+
```

---

## 🚀 Після виправлення:

### 1. Перезапустити backend:

```powershell
cd D:\Work\Pizza\backend
npm run dev
```

### 2. Перелогінитись:

1. Вийти з системи
2. Зайти знову
3. Перевірити чи працює

---

## ✅ Після виправлення:

- ✅ `GET /api/products` - має працювати
- ✅ `GET /api/tables` - має працювати
- ✅ `GET /api/orders` - має працювати
- ✅ Всі запити повертають `200 OK` замість `500 Internal Server Error`

---

**Створено:**
- `fix-existing-data.sql` - скрипт для оновлення існуючих даних
- `add-foreign-keys-only.sql` - скрипт для додавання foreign keys

