-- ============================================
-- ВИПРАВИТИ: Дозволити видалення столів з замовленнями
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- ВАРІАНТ 1: Видалити замовлення разом зі столом (CASCADE)
-- Рекомендується, якщо при видаленні столу потрібно видаляти всі замовлення
-- ============================================

-- 1. Видалити старий foreign key
ALTER TABLE orders 
DROP FOREIGN KEY orders_ibfk_1;

-- 2. Створити новий foreign key з ON DELETE CASCADE
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_table 
FOREIGN KEY (table_number) 
REFERENCES tables(number) 
ON UPDATE CASCADE 
ON DELETE CASCADE;

SELECT '✅ Foreign key оновлено: при видаленні столу будуть видалені всі замовлення (CASCADE)' as status;

-- ============================================
-- АЛЬТЕРНАТИВА (закоментовано):
-- ВАРІАНТ 2: Залишити замовлення з NULL table_number (SET NULL)
-- Рекомендується, якщо потрібно зберігати історію замовлень
-- ============================================
/*
-- Спочатку змінити table_number на NULLABLE
ALTER TABLE orders MODIFY COLUMN table_number INT NULL;

-- Видалити старий foreign key
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;

-- Створити новий foreign key з ON DELETE SET NULL
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_table 
FOREIGN KEY (table_number) 
REFERENCES tables(number) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

SELECT '✅ Foreign key оновлено: при видаленні столу table_number стане NULL (SET NULL)' as status;
*/

-- ============================================
-- ПЕРЕВІРКА
-- ============================================
SELECT '=== Перевірка foreign key ===' as info;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    UPDATE_RULE,
    DELETE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS r
    ON k.CONSTRAINT_NAME = r.CONSTRAINT_NAME
WHERE k.TABLE_SCHEMA = 'bar_kitchen_pos'
    AND k.TABLE_NAME = 'orders'
    AND k.COLUMN_NAME = 'table_number';


