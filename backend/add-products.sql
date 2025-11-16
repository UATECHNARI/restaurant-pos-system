-- Додавання товарів в базу даних
-- Використання: виконайте цей файл в MySQL

USE bar_kitchen_pos;

-- Очистити існуючі товари (опціонально, видаліть коментар якщо потрібно)
-- DELETE FROM products;

-- Додати Піцу
INSERT INTO products (name, price, category, description, image_url, available) VALUES
('Маргарита', 150.00, 'pizza', 'Класична піца з моцарелою та томатним соусом', NULL, 1),
('Пепероні', 180.00, 'pizza', 'Піца з пепероні та сиром', NULL, 1),
('Чотири сири', 200.00, 'pizza', 'Піца з моцарелою, пармезаном, горгонзолою та фетою', NULL, 1),
('Гавайська', 170.00, 'pizza', 'Піца з куркою, ананасами та сиром', NULL, 1),
('М\'ясна', 220.00, 'pizza', 'Піца з беконом, шинкою, ковбасою та сиром', NULL, 1),
('Вегетаріанська', 160.00, 'pizza', 'Піца з овочами: перець, помідори, гриби, оливки', NULL, 1);

-- Додати Каву
INSERT INTO products (name, price, category, description, image_url, available) VALUES
('Еспресо', 45.00, 'drinks', 'Класичний італійський еспресо', NULL, 1),
('Американо', 50.00, 'drinks', 'Еспресо з додаванням гарячої води', NULL, 1),
('Капучино', 60.00, 'drinks', 'Еспресо з молоком та молочною піною', NULL, 1),
('Лате', 65.00, 'drinks', 'Еспресо з великою кількістю молока', NULL, 1),
('Флет Вайт', 70.00, 'drinks', 'Еспресо з мікропіною молока', NULL, 1);

-- Додати Колу та інші напої
INSERT INTO products (name, price, category, description, image_url, available) VALUES
('Кока-Кола', 35.00, 'drinks', 'Coca-Cola 0.33л', NULL, 1),
('Кока-Кола Зеро', 35.00, 'drinks', 'Coca-Cola Zero 0.33л', NULL, 1),
('Фанта', 35.00, 'drinks', 'Fanta 0.33л', NULL, 1),
('Спрайт', 35.00, 'drinks', 'Sprite 0.33л', NULL, 1),
('Вода мінеральна', 25.00, 'drinks', 'Мінеральна вода 0.5л', NULL, 1),
('Сік апельсиновий', 40.00, 'drinks', 'Свіжовичавлений апельсиновий сік', NULL, 1);

-- Перевірка доданих товарів
SELECT category, COUNT(*) as count, SUM(available) as available_count 
FROM products 
GROUP BY category;

-- Показати всі товари
SELECT id, name, price, category, available 
FROM products 
ORDER BY category, name;



