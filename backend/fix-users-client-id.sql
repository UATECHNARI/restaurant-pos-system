-- ============================================
-- Виправлення: Додати client_id в users
-- ВАЖЛИВО: Спочатку має існувати таблиця clients!
-- ============================================

USE bar_kitchen_pos;

-- Перевірити чи існує таблиця clients
SELECT COUNT(*) as clients_exists 
FROM information_schema.tables 
WHERE table_schema = 'bar_kitchen_pos' 
AND table_name = 'clients';

-- Якщо таблиця clients не існує - створити її
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

-- Перевірити чи існує колонка client_id
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'client_id'
);

-- Додати колонку client_id тільки якщо вона не існує
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

-- Перевірити чи існує foreign key
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'client_id'
    AND REFERENCED_TABLE_NAME = 'clients'
);

-- Додати foreign key тільки якщо його немає
SET @sql_fk = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

SELECT '✅ Перевірка завершена! Колонка client_id додана (або вже існує)' as status;

-- Показати структуру users
DESCRIBE users;


