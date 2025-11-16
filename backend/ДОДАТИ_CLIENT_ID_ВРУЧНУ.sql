-- ============================================
-- КОМАНДИ ДЛЯ ВИКОНАННЯ ВРУЧНУ В MySQL
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- КРОК 1: Перевірити чи існує таблиця clients
-- ============================================
SHOW TABLES LIKE 'clients';

-- Якщо таблиця НЕ існує - виконати:
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
-- КРОК 2: Перевірити чи існує колонка client_id в users
-- ============================================
DESCRIBE users;

-- Якщо колонки client_id НЕ існує - виконати:
ALTER TABLE users 
ADD COLUMN client_id INT NULL AFTER id;

-- ============================================
-- КРОК 3: Додати індекс (якщо ще немає)
-- ============================================
ALTER TABLE users 
ADD INDEX idx_client_id (client_id);

-- Якщо помилка "Duplicate key name" - ігноруйте, індекс вже існує

-- ============================================
-- КРОК 4: Додати foreign key (ВАЖЛИВО: тільки після створення clients!)
-- ============================================
ALTER TABLE users 
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Якщо помилка "Duplicate foreign key" - ігноруйте, foreign key вже існує

-- ============================================
-- ПЕРЕВІРКА:
-- ============================================
DESCRIBE users;
SHOW CREATE TABLE users;


