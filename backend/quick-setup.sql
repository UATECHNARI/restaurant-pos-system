-- ============================================
-- ШВИДКЕ НАЛАШТУВАННЯ БАЗИ ДАНИХ
-- ============================================
-- Просто скопіюйте весь цей файл і виконайте в MySQL

USE bar_kitchen_pos;

-- Видалити старі таблиці якщо є (необов'язково)
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS tables;
-- DROP TABLE IF EXISTS users;

-- ============================================
-- Створення таблиць
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'kitchen', 'bar') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('kitchen', 'bar') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_number (number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL,
    comment TEXT NULL,
    status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_number) REFERENCES tables(number) ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_table_number (table_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('kitchen', 'bar') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Додавання тестових даних
-- ============================================

-- Продукти - Кухня
INSERT INTO products (name, category, price, description) VALUES
('Піца Маргарита', 'kitchen', 150.00, 'Томатний соус, моцарела, базилік'),
('Піца Пепероні', 'kitchen', 180.00, 'Томатний соус, моцарела, пепероні'),
('Чізбургер', 'kitchen', 120.00, 'Котлета яловичина, сир чеддер, овочі'),
('Паста Карбонара', 'kitchen', 140.00, 'Спагеті, бекон, вершки, пармезан'),
('Стейк Рібай', 'kitchen', 320.00, 'Яловичий стейк 250г з овочами гриль'),
('Салат Цезар', 'kitchen', 95.00, 'Курка, салат, пармезан, соус цезар');

-- Продукти - Бар
INSERT INTO products (name, category, price, description) VALUES
('Мохіто', 'bar', 80.00, 'Ром, м\'ята, лайм, содова'),
('Маргарита', 'bar', 90.00, 'Текіла, лайм, апельсиновий лікер'),
('Віскі з колою', 'bar', 100.00, 'Віскі Jack Daniels, кола'),
('Пиво світле', 'bar', 45.00, 'Stella Artois 0.5л'),
('Джін-тонік', 'bar', 85.00, 'Джін Bombay, тонік, лайм'),
('Еспресо', 'bar', 35.00, 'Подвійний еспресо'),
('Капучино', 'bar', 45.00, 'Еспресо з молочною піною'),
('Латте', 'bar', 50.00, 'Еспресо з молоком');

-- Столи
INSERT INTO tables (number, capacity, status) VALUES
(1, 2, 'available'),
(2, 4, 'available'),
(3, 4, 'available'),
(4, 6, 'available'),
(5, 2, 'available'),
(6, 4, 'available'),
(7, 8, 'available'),
(8, 2, 'available'),
(9, 4, 'available'),
(10, 6, 'available');

-- ============================================
-- Готово!
-- ============================================

SELECT 'Таблиці створено успішно!' AS message;
SELECT 'Тепер виконайте: npm run init:users' AS next_step;




