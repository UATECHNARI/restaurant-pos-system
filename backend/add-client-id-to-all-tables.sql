-- ============================================
-- Додати client_id до ВСІХ таблиць
-- Цей скрипт автоматично перевіряє чи існує колонка
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- 1. Перевірити чи існує таблиця clients
-- ============================================
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

-- ============================================
-- 2. Додати client_id до users (якщо не існує)
-- ============================================
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN client_id INT NULL AFTER id',
    'SELECT "Column client_id already exists in users" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_idx = IF(@idx_exists = 0,
    'ALTER TABLE users ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists in users" as message'
);
PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);
SET @sql_fk = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists in users" as message'
);
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- ============================================
-- 3. Додати client_id до products (якщо не існує)
-- ============================================
SET @prod_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_prod = IF(@prod_col_exists = 0,
    'ALTER TABLE products ADD COLUMN client_id INT NOT NULL AFTER id',
    'SELECT "Column client_id already exists in products" as message'
);
PREPARE stmt_prod FROM @sql_prod;
EXECUTE stmt_prod;
DEALLOCATE PREPARE stmt_prod;

SET @prod_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_prod_idx = IF(@prod_idx_exists = 0,
    'ALTER TABLE products ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists in products" as message'
);
PREPARE stmt_prod_idx FROM @sql_prod_idx;
EXECUTE stmt_prod_idx;
DEALLOCATE PREPARE stmt_prod_idx;

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

-- ============================================
-- 4. Додати client_id до tables (якщо не існує)
-- ============================================
SET @tables_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_tables = IF(@tables_col_exists = 0,
    'ALTER TABLE tables ADD COLUMN client_id INT NOT NULL AFTER id',
    'SELECT "Column client_id already exists in tables" as message'
);
PREPARE stmt_tables FROM @sql_tables;
EXECUTE stmt_tables;
DEALLOCATE PREPARE stmt_tables;

SET @tables_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_tables_idx = IF(@tables_idx_exists = 0,
    'ALTER TABLE tables ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists in tables" as message'
);
PREPARE stmt_tables_idx FROM @sql_tables_idx;
EXECUTE stmt_tables_idx;
DEALLOCATE PREPARE stmt_tables_idx;

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

-- ============================================
-- 5. Додати client_id до orders (якщо не існує)
-- ============================================
SET @orders_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_orders = IF(@orders_col_exists = 0,
    'ALTER TABLE orders ADD COLUMN client_id INT NOT NULL AFTER id',
    'SELECT "Column client_id already exists in orders" as message'
);
PREPARE stmt_orders FROM @sql_orders;
EXECUTE stmt_orders;
DEALLOCATE PREPARE stmt_orders;

SET @orders_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_orders_idx = IF(@orders_idx_exists = 0,
    'ALTER TABLE orders ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists in orders" as message'
);
PREPARE stmt_orders_idx FROM @sql_orders_idx;
EXECUTE stmt_orders_idx;
DEALLOCATE PREPARE stmt_orders_idx;

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

-- ============================================
-- 6. Додати client_id до order_items (якщо не існує)
-- ============================================
SET @order_items_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_order_items = IF(@order_items_col_exists = 0,
    'ALTER TABLE order_items ADD COLUMN client_id INT NOT NULL AFTER id',
    'SELECT "Column client_id already exists in order_items" as message'
);
PREPARE stmt_order_items FROM @sql_order_items;
EXECUTE stmt_order_items;
DEALLOCATE PREPARE stmt_order_items;

SET @order_items_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_order_items_idx = IF(@order_items_idx_exists = 0,
    'ALTER TABLE order_items ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists in order_items" as message'
);
PREPARE stmt_order_items_idx FROM @sql_order_items_idx;
EXECUTE stmt_order_items_idx;
DEALLOCATE PREPARE stmt_order_items_idx;

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

SELECT '✅ Перевірка завершена! Всі колонки client_id додані (або вже існують)' as status;

-- Показати структуру таблиць
SELECT '=== Структура users ===' as info;
DESCRIBE users;

SELECT '=== Структура products ===' as info;
DESCRIBE products;

SELECT '=== Структура tables ===' as info;
DESCRIBE tables;

SELECT '=== Структура orders ===' as info;
DESCRIBE orders;

SELECT '=== Структура order_items ===' as info;
DESCRIBE order_items;


