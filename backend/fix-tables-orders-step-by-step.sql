-- ============================================
-- ПОКРОКОВЕ ДОДАВАННЯ client_id до tables та orders
-- Спочатку додаємо колонки, потім оновлюємо дані, потім foreign keys
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- КРОК 1: Додати колонку client_id до tables (без foreign key)
-- ============================================
SET @tables_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_tables = IF(@tables_col_exists = 0,
    'ALTER TABLE tables ADD COLUMN client_id INT NULL AFTER id',
    'SELECT "Column client_id already exists in tables" as message'
);
PREPARE stmt_tables FROM @sql_tables;
EXECUTE stmt_tables;
DEALLOCATE PREPARE stmt_tables;

SELECT '✅ Крок 1: Колонка client_id додана до tables' as status;

-- ============================================
-- КРОК 2: Додати колонку client_id до orders (без foreign key)
-- ============================================
SET @orders_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_orders = IF(@orders_col_exists = 0,
    'ALTER TABLE orders ADD COLUMN client_id INT NULL AFTER id',
    'SELECT "Column client_id already exists in orders" as message'
);
PREPARE stmt_orders FROM @sql_orders;
EXECUTE stmt_orders;
DEALLOCATE PREPARE stmt_orders;

SELECT '✅ Крок 2: Колонка client_id додана до orders' as status;

-- ============================================
-- КРОК 3: Оновити існуючі дані в tables
-- ============================================
UPDATE tables 
SET client_id = 1 
WHERE client_id IS NULL OR client_id = 0;

-- Показати скільки оновлено
SELECT CONCAT('✅ Крок 3: Оновлено ', COUNT(*), ' записів у tables') as status
FROM tables WHERE client_id = 1;

-- ============================================
-- КРОК 4: Оновити існуючі дані в orders
-- ============================================
UPDATE orders 
SET client_id = 1 
WHERE client_id IS NULL OR client_id = 0;

-- Показати скільки оновлено
SELECT CONCAT('✅ Крок 4: Оновлено ', COUNT(*), ' записів у orders') as status
FROM orders WHERE client_id = 1;

-- ============================================
-- КРОК 5: Оновити існуючі дані в order_items (через orders)
-- ============================================
-- Спочатку додати колонку, якщо не існує
SET @order_items_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_order_items = IF(@order_items_col_exists = 0,
    'ALTER TABLE order_items ADD COLUMN client_id INT NULL AFTER id',
    'SELECT "Column client_id already exists in order_items" as message'
);
PREPARE stmt_order_items FROM @sql_order_items;
EXECUTE stmt_order_items;
DEALLOCATE PREPARE stmt_order_items;

-- Оновити через JOIN з orders
UPDATE order_items oi
INNER JOIN orders o ON oi.order_id = o.id
SET oi.client_id = o.client_id
WHERE oi.client_id IS NULL OR oi.client_id = 0;

SELECT '✅ Крок 5: Оновлено order_items' as status;

-- ============================================
-- КРОК 6: Оновити products (виправити некоректні client_id)
-- ============================================
UPDATE products 
SET client_id = 1 
WHERE client_id IS NULL OR client_id = 0 OR client_id NOT IN (SELECT id FROM clients);

SELECT '✅ Крок 6: Виправлено client_id у products' as status;

-- ============================================
-- КРОК 7: Змінити client_id на NOT NULL (для tables, orders, products, order_items)
-- ============================================
-- Tables
ALTER TABLE tables MODIFY COLUMN client_id INT NOT NULL;

-- Orders
ALTER TABLE orders MODIFY COLUMN client_id INT NOT NULL;

-- Products (якщо ще не NOT NULL)
SET @prod_nullable = (
    SELECT IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_prod_notnull = IF(@prod_nullable = 'YES',
    'ALTER TABLE products MODIFY COLUMN client_id INT NOT NULL',
    'SELECT "Column client_id already NOT NULL in products" as message'
);
PREPARE stmt_prod_notnull FROM @sql_prod_notnull;
EXECUTE stmt_prod_notnull;
DEALLOCATE PREPARE stmt_prod_notnull;

-- Order items
ALTER TABLE order_items MODIFY COLUMN client_id INT NOT NULL;

SELECT '✅ Крок 7: Змінено client_id на NOT NULL' as status;

-- ============================================
-- КРОК 8: Додати індекси
-- ============================================
-- Tables
SET @tables_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_tables_idx = IF(@tables_idx_exists = 0,
    'ALTER TABLE tables ADD INDEX idx_client_id (client_id)',
    'SELECT "Index already exists in tables" as message'
);
PREPARE stmt_tables_idx FROM @sql_tables_idx;
EXECUTE stmt_tables_idx;
DEALLOCATE PREPARE stmt_tables_idx;

-- Orders
SET @orders_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_orders_idx = IF(@orders_idx_exists = 0,
    'ALTER TABLE orders ADD INDEX idx_client_id (client_id)',
    'SELECT "Index already exists in orders" as message'
);
PREPARE stmt_orders_idx FROM @sql_orders_idx;
EXECUTE stmt_orders_idx;
DEALLOCATE PREPARE stmt_orders_idx;

-- Order items
SET @order_items_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_order_items_idx = IF(@order_items_idx_exists = 0,
    'ALTER TABLE order_items ADD INDEX idx_client_id (client_id)',
    'SELECT "Index already exists in order_items" as message'
);
PREPARE stmt_order_items_idx FROM @sql_order_items_idx;
EXECUTE stmt_order_items_idx;
DEALLOCATE PREPARE stmt_order_items_idx;

SELECT '✅ Крок 8: Додано індекси' as status;

-- ============================================
-- КРОК 9: Додати foreign keys
-- ============================================
-- Tables
SET @tables_fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);
SET @sql_tables_fk = IF(@tables_fk_exists = 0,
    'ALTER TABLE tables ADD CONSTRAINT fk_tables_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists in tables" as message'
);
PREPARE stmt_tables_fk FROM @sql_tables_fk;
EXECUTE stmt_tables_fk;
DEALLOCATE PREPARE stmt_tables_fk;

-- Orders
SET @orders_fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);
SET @sql_orders_fk = IF(@orders_fk_exists = 0,
    'ALTER TABLE orders ADD CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists in orders" as message'
);
PREPARE stmt_orders_fk FROM @sql_orders_fk;
EXECUTE stmt_orders_fk;
DEALLOCATE PREPARE stmt_orders_fk;

-- Order items
SET @order_items_fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);
SET @sql_order_items_fk = IF(@order_items_fk_exists = 0,
    'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists in order_items" as message'
);
PREPARE stmt_order_items_fk FROM @sql_order_items_fk;
EXECUTE stmt_order_items_fk;
DEALLOCATE PREPARE stmt_order_items_fk;

-- Products (перевірити чи існує)
SET @prod_fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);
SET @sql_prod_fk = IF(@prod_fk_exists = 0,
    'ALTER TABLE products ADD CONSTRAINT fk_products_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists in products" as message'
);
PREPARE stmt_prod_fk FROM @sql_prod_fk;
EXECUTE stmt_prod_fk;
DEALLOCATE PREPARE stmt_prod_fk;

SELECT '✅ Крок 9: Додано foreign keys' as status;

-- ============================================
-- ПЕРЕВІРКА
-- ============================================
SELECT '✅ ВСЕ ГОТОВО! Перевірка структури:' as final_status;

SELECT '=== Структура tables ===' as info;
DESCRIBE tables;

SELECT '=== Структура orders ===' as info;
DESCRIBE orders;

SELECT '=== Структура order_items ===' as info;
DESCRIBE order_items;


