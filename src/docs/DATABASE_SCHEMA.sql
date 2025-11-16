-- ============================================
-- Bar & Kitchen POS System - MySQL Database Schema
-- ============================================

-- Створення бази даних
CREATE DATABASE IF NOT EXISTS bar_kitchen_pos 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bar_kitchen_pos;

-- ============================================
-- Таблиця користувачів
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'kitchen', 'bar') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця товарів
-- ============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('kitchen', 'bar', 'drinks', 'desserts') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця столів
-- ============================================
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    seats INT NOT NULL,
    status ENUM('available', 'occupied') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_number (number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця замовлень
-- ============================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL,
    comment TEXT NULL,
    status ENUM('accepted', 'preparing', 'ready', 'served') DEFAULT 'accepted',
    total_price DECIMAL(10, 2) NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_number) REFERENCES tables(number) ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_table_number (table_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця позицій замовлення
-- ============================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL, -- Зберігаємо назву на момент замовлення
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Ціна на момент замовлення
    category ENUM('kitchen', 'bar', 'drinks', 'desserts') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Таблиця логів (опціонально для аудиту)
-- ============================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Початкові дані
-- ============================================

-- Користувачі (пароль: password123 - хешувати в backend!)
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin'),
('cashier1', '$2b$10$YourHashedPasswordHere', 'cashier'),
('kitchen1', '$2b$10$YourHashedPasswordHere', 'kitchen'),
('bar1', '$2b$10$YourHashedPasswordHere', 'bar');

-- Товари
INSERT INTO products (name, category, price) VALUES
-- Кухня
('Маргарита', 'kitchen', 150.00),
('Пепероні', 'kitchen', 180.00),
('Бургер', 'kitchen', 120.00),
('Паста Карбонара', 'kitchen', 140.00),
('Стейк', 'kitchen', 320.00),
('Цезар салат', 'kitchen', 95.00),

-- Бар
('Мохіто', 'bar', 80.00),
('Маргарита', 'bar', 90.00),
('Віскі кола', 'bar', 100.00),
('Пиво світле', 'bar', 45.00),
('Джін тонік', 'bar', 85.00),

-- Напої
('Еспресо', 'drinks', 35.00),
('Капучино', 'drinks', 45.00),
('Латте', 'drinks', 50.00),
('Кола', 'drinks', 40.00),
('Сік апельсиновий', 'drinks', 35.00),
('Мінеральна вода', 'drinks', 25.00),

-- Десерти
('Чізкейк', 'desserts', 70.00),
('Тірамісу', 'desserts', 85.00),
('Наполеон', 'desserts', 65.00),
('Морозиво', 'desserts', 45.00);

-- Столи
INSERT INTO tables (number, seats, status) VALUES
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
-- Корисні представлення (Views)
-- ============================================

-- Представлення для активних замовлень з деталями
CREATE VIEW active_orders_view AS
SELECT 
    o.id,
    o.table_number,
    o.comment,
    o.status,
    o.total_price,
    o.created_at,
    u.username as created_by_username,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'served'
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Представлення для статистики по днях
CREATE VIEW daily_statistics_view AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders_count,
    SUM(total_price) as total_revenue,
    AVG(total_price) as average_check
FROM orders
WHERE status = 'served'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- Збережені процедури
-- ============================================

-- Процедура для створення замовлення
DELIMITER //
CREATE PROCEDURE create_order(
    IN p_table_number INT,
    IN p_comment TEXT,
    IN p_created_by INT,
    OUT p_order_id INT
)
BEGIN
    DECLARE v_total_price DECIMAL(10, 2) DEFAULT 0;
    
    -- Створити замовлення
    INSERT INTO orders (table_number, comment, status, total_price, created_by)
    VALUES (p_table_number, p_comment, 'accepted', 0, p_created_by);
    
    SET p_order_id = LAST_INSERT_ID();
    
    -- Оновити статус столу
    UPDATE tables SET status = 'occupied' WHERE number = p_table_number;
END //
DELIMITER ;

-- Процедура для додавання позиції в замовлення
DELIMITER //
CREATE PROCEDURE add_order_item(
    IN p_order_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_product_name VARCHAR(100);
    DECLARE v_product_price DECIMAL(10, 2);
    DECLARE v_product_category VARCHAR(20);
    
    -- Отримати дані товару
    SELECT name, price, category 
    INTO v_product_name, v_product_price, v_product_category
    FROM products 
    WHERE id = p_product_id AND is_active = TRUE;
    
    -- Додати позицію
    INSERT INTO order_items (order_id, product_id, product_name, quantity, price, category)
    VALUES (p_order_id, p_product_id, v_product_name, p_quantity, v_product_price, v_product_category);
    
    -- Оновити загальну суму замовлення
    UPDATE orders 
    SET total_price = (
        SELECT SUM(price * quantity) 
        FROM order_items 
        WHERE order_id = p_order_id
    )
    WHERE id = p_order_id;
END //
DELIMITER ;

-- Процедура для зміни статусу замовлення
DELIMITER //
CREATE PROCEDURE update_order_status(
    IN p_order_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    DECLARE v_table_number INT;
    
    -- Оновити статус замовлення
    UPDATE orders 
    SET status = p_new_status 
    WHERE id = p_order_id;
    
    -- Якщо замовлення подано - звільнити стіл
    IF p_new_status = 'served' THEN
        SELECT table_number INTO v_table_number FROM orders WHERE id = p_order_id;
        UPDATE tables SET status = 'available' WHERE number = v_table_number;
    END IF;
END //
DELIMITER ;

-- ============================================
-- Тригери
-- ============================================

-- Тригер для логування змін статусу замовлення
DELIMITER //
CREATE TRIGGER log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (action, entity_type, entity_id, description)
        VALUES (
            'status_change',
            'order',
            NEW.id,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END //
DELIMITER ;

-- ============================================
-- Індекси для продуктивності
-- ============================================

-- Композитні індекси
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
CREATE INDEX idx_order_items_order_category ON order_items(order_id, category);

COMMIT;
