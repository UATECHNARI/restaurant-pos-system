-- Додати колонку icon в таблицю products
-- Варіанти значка: pizza, salad, cola, alcohol, coffee

USE bar_kitchen_pos;

-- Додати колонку icon як ENUM з варіантами
ALTER TABLE products 
ADD COLUMN icon ENUM('pizza', 'salad', 'cola', 'alcohol', 'coffee') NULL DEFAULT NULL
AFTER category;

-- Оновити існуючі товари з категорією kitchen - встановити pizza за замовчуванням
UPDATE products 
SET icon = 'pizza' 
WHERE category = 'kitchen' AND icon IS NULL;

-- Оновити існуючі товари з категорією bar - встановити alcohol за замовчуванням
UPDATE products 
SET icon = 'alcohol' 
WHERE category = 'bar' AND icon IS NULL;


