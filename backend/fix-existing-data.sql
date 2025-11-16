-- ============================================
-- Виправити існуючі дані перед додаванням foreign key
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- 1. Перевірити чи є клієнти
-- ============================================
SELECT 'Клієнти:' as info;
SELECT * FROM clients;

-- ============================================
-- 2. Оновити products: призначити client_id = 1 (якщо NULL або невалідний)
-- ============================================
SELECT 'Оновлення products...' as info;

-- Встановити client_id = 1 для всіх products, де client_id NULL або не відповідає жодному клієнту
UPDATE products 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);

SELECT CONCAT('Оновлено ', ROW_COUNT(), ' записів в products') as result;

-- ============================================
-- 3. Оновити tables: призначити client_id = 1 (якщо NULL або невалідний)
-- ============================================
SELECT 'Оновлення tables...' as info;

-- Встановити client_id = 1 для всіх tables, де client_id NULL або не відповідає жодному клієнту
UPDATE tables 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);

SELECT CONCAT('Оновлено ', ROW_COUNT(), ' записів в tables') as result;

-- ============================================
-- 4. Оновити orders: призначити client_id = 1 (якщо NULL або невалідний)
-- ============================================
SELECT 'Оновлення orders...' as info;

-- Встановити client_id = 1 для всіх orders, де client_id NULL або не відповідає жодному клієнту
UPDATE orders 
SET client_id = 1 
WHERE client_id IS NULL 
   OR client_id = 0 
   OR client_id NOT IN (SELECT id FROM clients);

SELECT CONCAT('Оновлено ', ROW_COUNT(), ' записів в orders') as result;

-- ============================================
-- 5. Оновити order_items через orders
-- ============================================
SELECT 'Оновлення order_items...' as info;

-- Оновити order_items через orders (якщо колонка client_id існує)
UPDATE order_items oi
INNER JOIN orders o ON oi.order_id = o.id
SET oi.client_id = o.client_id
WHERE oi.client_id IS NULL 
   OR oi.client_id = 0 
   OR oi.client_id NOT IN (SELECT id FROM clients);

SELECT CONCAT('Оновлено ', ROW_COUNT(), ' записів в order_items') as result;

-- ============================================
-- 6. Перевірити дані
-- ============================================
SELECT 'Перевірка products:' as info;
SELECT id, name, client_id FROM products;

SELECT 'Перевірка tables:' as info;
SELECT id, number, client_id FROM tables;

SELECT 'Перевірка orders:' as info;
SELECT id, client_id, created_at FROM orders;

SELECT '✅ Дані оновлені! Тепер можна додавати foreign keys.' as status;

