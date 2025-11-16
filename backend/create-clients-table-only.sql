-- ============================================
-- ШВИДКЕ ВИПРАВЛЕННЯ: Створити тільки таблицю clients
-- ============================================

USE bar_kitchen_pos;

-- Створити таблицю clients (клієнти)
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

-- Перевірити чи існує колонка client_id в users
-- Якщо немає - додати її
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

-- Додати індекс (якщо не існує)
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

-- Додати foreign key (якщо ще немає)
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

SELECT '✅ Таблиця clients створена (або вже існує)' as status;

