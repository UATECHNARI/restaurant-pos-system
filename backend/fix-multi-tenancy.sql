-- ============================================
-- Виправлення мультитенантності (перевіряє чи вже існує)
-- Безпечний скрипт - можна виконувати кілька разів
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- 1. Створити таблицю clients (якщо не існує)
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
-- 2. Додати client_id в users (якщо не існує)
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
    'SELECT "Column client_id already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. Додати індекс для client_id (якщо не існує)
-- ============================================
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_client_id'
);

SET @sql_index = IF(@index_exists = 0,
    'ALTER TABLE users ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists" as message'
);

PREPARE stmt_index FROM @sql_index;
EXECUTE stmt_index;
DEALLOCATE PREPARE stmt_index;

-- ============================================
-- 4. Додати foreign key (якщо не існує)
-- ============================================
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
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- ============================================
-- 5. Додати client_id в products (якщо не існує)
-- ============================================
SET @col_products = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_products = IF(@col_products = 0,
    'ALTER TABLE products ADD COLUMN client_id INT NOT NULL AFTER id, ADD INDEX idx_client_id (client_id), ADD CONSTRAINT fk_products_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Column client_id already exists in products" as message'
);

PREPARE stmt_products FROM @sql_products;
EXECUTE stmt_products;
DEALLOCATE PREPARE stmt_products;

-- Додати унікальний індекс для name + client_id в products
SET @unique_index = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND INDEX_NAME = 'idx_name_client'
);

SET @sql_unique = IF(@unique_index = 0,
    'ALTER TABLE products ADD UNIQUE INDEX idx_name_client (name, client_id)',
    'SELECT "Unique index idx_name_client already exists" as message'
);

PREPARE stmt_unique FROM @sql_unique;
EXECUTE stmt_unique;
DEALLOCATE PREPARE stmt_unique;

-- ============================================
-- 6. Додати client_id в tables (якщо не існує)
-- ============================================
SET @col_tables = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_tables = IF(@col_tables = 0,
    'ALTER TABLE tables ADD COLUMN client_id INT NOT NULL AFTER id, ADD INDEX idx_client_id (client_id), ADD CONSTRAINT fk_tables_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Column client_id already exists in tables" as message'
);

PREPARE stmt_tables FROM @sql_tables;
EXECUTE stmt_tables;
DEALLOCATE PREPARE stmt_tables;

-- Оновити унікальний індекс для number + client_id в tables
SET @unique_table = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND INDEX_NAME = 'idx_number_client'
);

-- Видалити старий унікальний індекс number (якщо існує)
SET @old_index = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'tables' 
    AND INDEX_NAME = 'number'
    AND NON_UNIQUE = 0
);

SET @sql_drop = IF(@old_index > 0 AND @unique_table = 0,
    'ALTER TABLE tables DROP INDEX number',
    'SELECT "Old index does not need to be dropped" as message'
);

PREPARE stmt_drop FROM @sql_drop;
EXECUTE stmt_drop;
DEALLOCATE PREPARE stmt_drop;

-- Додати новий унікальний індекс
SET @sql_table_unique = IF(@unique_table = 0,
    'ALTER TABLE tables ADD UNIQUE INDEX idx_number_client (number, client_id)',
    'SELECT "Unique index idx_number_client already exists" as message'
);

PREPARE stmt_table_unique FROM @sql_table_unique;
EXECUTE stmt_table_unique;
DEALLOCATE PREPARE stmt_table_unique;

-- ============================================
-- 7. Додати client_id в orders (якщо не існує)
-- ============================================
SET @col_orders = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_orders = IF(@col_orders = 0,
    'ALTER TABLE orders ADD COLUMN client_id INT NOT NULL AFTER id, ADD INDEX idx_client_id (client_id), ADD CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Column client_id already exists in orders" as message'
);

PREPARE stmt_orders FROM @sql_orders;
EXECUTE stmt_orders;
DEALLOCATE PREPARE stmt_orders;

-- ============================================
-- 8. Додати client_id в order_items (якщо не існує)
-- ============================================
SET @col_order_items = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_order_items = IF(@col_order_items = 0,
    'ALTER TABLE order_items ADD COLUMN client_id INT NOT NULL AFTER id, ADD INDEX idx_client_id (client_id), ADD CONSTRAINT fk_order_items_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Column client_id already exists in order_items" as message'
);

PREPARE stmt_order_items FROM @sql_order_items;
EXECUTE stmt_order_items;
DEALLOCATE PREPARE stmt_order_items;

-- ============================================
-- 9. Додати client_id в activity_logs (якщо не існує)
-- ============================================
SET @col_logs = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'activity_logs' 
    AND COLUMN_NAME = 'client_id'
);

SET @sql_logs = IF(@col_logs = 0,
    'ALTER TABLE activity_logs ADD COLUMN client_id INT NULL AFTER id, ADD INDEX idx_client_id (client_id), ADD CONSTRAINT fk_activity_logs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL',
    'SELECT "Column client_id already exists in activity_logs" as message'
);

PREPARE stmt_logs FROM @sql_logs;
EXECUTE stmt_logs;
DEALLOCATE PREPARE stmt_logs;

SELECT '✅ Мультитенантність налаштована! Всі колонки та індекси перевірені.' as status;

