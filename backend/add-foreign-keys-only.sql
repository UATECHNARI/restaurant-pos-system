-- ============================================
-- Додати foreign keys до всіх таблиць
-- ВАЖЛИВО: Спочатку виконати fix-existing-data.sql!
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- 1. Додати foreign key до products (якщо не існує)
-- ============================================
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
-- 2. Додати foreign key до tables (якщо не існує)
-- ============================================
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
-- 3. Додати foreign key до orders (якщо не існує)
-- ============================================
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
-- 4. Додати foreign key до order_items (якщо не існує)
-- ============================================
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

SELECT '✅ Всі foreign keys додані (або вже існують)!' as status;

