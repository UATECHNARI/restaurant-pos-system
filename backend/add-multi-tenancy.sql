-- ============================================
-- Додавання мультитенантності (Multi-tenancy)
-- Кожен клієнт має свою базу даних (товари, кухня, бар, каса)
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- 1. Створити таблицю clients (клієнти)
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
-- 2. Додати client_id в таблицю users
-- ============================================
-- Перевірити чи існує колонка client_id
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'client_id'
);

-- Додати колонку тільки якщо вона не існує
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN client_id INT NULL AFTER id',
    'SELECT "Column client_id already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Додати індекс тільки якщо він не існує
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_client_id'
);
SET @sql_idx = IF(@idx_exists = 0,
    'ALTER TABLE users ADD INDEX idx_client_id (client_id)',
    'SELECT "Index idx_client_id already exists" as message'
);
PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Додати foreign key тільки якщо його немає
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

-- Для адмінів: client_id = NULL (будуть налаштовані пізніше)
-- Для користувачів з ролями: client_id вказує на клієнта

-- ============================================
-- 3. Додати client_id в таблицю products
-- ============================================
-- Перевірити чи існує колонка client_id
SET @prod_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'client_id'
);

-- Додати колонку тільки якщо вона не існує
SET @sql_prod = IF(@prod_col_exists = 0,
    'ALTER TABLE products ADD COLUMN client_id INT NOT NULL AFTER id',
    'SELECT "Column client_id already exists in products" as message'
);
PREPARE stmt_prod FROM @sql_prod;
EXECUTE stmt_prod;
DEALLOCATE PREPARE stmt_prod;

-- Додати індекс
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

-- Додати foreign key
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

-- Створити унікальний індекс для name + client_id (якщо не існує)
SET @prod_name_idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'products' 
    AND INDEX_NAME = 'idx_name_client'
);
SET @sql_prod_name_idx = IF(@prod_name_idx_exists = 0,
    'ALTER TABLE products ADD UNIQUE INDEX idx_name_client (name, client_id)',
    'SELECT "Index idx_name_client already exists in products" as message'
);
PREPARE stmt_prod_name_idx FROM @sql_prod_name_idx;
EXECUTE stmt_prod_name_idx;
DEALLOCATE PREPARE stmt_prod_name_idx;

-- ============================================
-- 4. Додати client_id в таблицю tables
-- ============================================
ALTER TABLE tables 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Створити унікальний індекс для number + client_id
ALTER TABLE tables 
DROP INDEX IF EXISTS number;
ALTER TABLE tables 
ADD UNIQUE INDEX idx_number_client (number, client_id);

-- ============================================
-- 5. Додати client_id в таблицю orders
-- ============================================
ALTER TABLE orders 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- ============================================
-- 6. Додати client_id в таблицю order_items (через orders)
-- Примітка: order_items має order_id, який вже пов'язаний з orders,
-- тому client_id можна отримати через JOIN. Але для оптимізації додамо напряму.
-- ============================================
ALTER TABLE order_items 
ADD COLUMN client_id INT NOT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- ============================================
-- 7. Додати client_id в таблицю activity_logs
-- ============================================
ALTER TABLE activity_logs 
ADD COLUMN client_id INT NULL AFTER id,
ADD INDEX idx_client_id (client_id),
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- ============================================
-- 8. Створити тестового клієнта (якщо потрібно)
-- ============================================
-- INSERT INTO clients (name, email, status) 
-- VALUES ('Тестовий клієнт', 'test@client.com', 'active');

-- ============================================
-- 9. Міграція існуючих даних (опціонально)
-- Якщо вже є дані, потрібно призначити їх до клієнта
-- ============================================
-- Приклад для існуючих користувачів:
-- UPDATE users SET client_id = 1 WHERE client_id IS NULL AND role != 'admin';

-- Приклад для існуючих товарів:
-- UPDATE products SET client_id = 1 WHERE client_id IS NULL;

-- Приклад для існуючих столів:
-- UPDATE tables SET client_id = 1 WHERE client_id IS NULL;

-- Приклад для існуючих замовлень:
-- UPDATE orders SET client_id = 1 WHERE client_id IS NULL;

-- Приклад для order_items:
-- UPDATE order_items oi
-- INNER JOIN orders o ON oi.order_id = o.id
-- SET oi.client_id = o.client_id
-- WHERE oi.client_id IS NULL;

-- ============================================
-- 10. Створити VIEW для швидкого доступу до даних клієнта
-- ============================================
CREATE OR REPLACE VIEW client_products_view AS
SELECT p.*, c.name as client_name, c.email as client_email
FROM products p
INNER JOIN clients c ON p.client_id = c.id
WHERE c.status = 'active';

CREATE OR REPLACE VIEW client_orders_view AS
SELECT o.*, c.name as client_name, u.email as created_by_email
FROM orders o
INNER JOIN clients c ON o.client_id = c.id
LEFT JOIN users u ON o.created_by = u.id
WHERE c.status = 'active';

