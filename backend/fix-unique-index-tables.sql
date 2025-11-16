-- ============================================
-- ВИПРАВИТИ: Унікальний індекс для tables (number + client_id)
-- Проблема: Можливо є старий UNIQUE індекс тільки на number
-- ============================================

USE bar_kitchen_pos;

-- ============================================
-- КРОК 1: Знайти всі індекси на number в таблиці tables
-- ============================================
SELECT 
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    NON_UNIQUE,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
    AND TABLE_NAME = 'tables'
    AND (COLUMN_NAME = 'number' OR INDEX_NAME LIKE '%number%')
GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE;

-- ============================================
-- КРОК 2: Видалити старі унікальні індекси на number (якщо є)
-- ============================================

-- Перевірити чи існує старий UNIQUE індекс на number (без client_id)
SET @old_unique_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
        AND TABLE_NAME = 'tables'
        AND INDEX_NAME = 'number'
        AND NON_UNIQUE = 0
        AND COLUMN_NAME = 'number'
);

SET @sql_drop_old = IF(@old_unique_exists > 0,
    'ALTER TABLE tables DROP INDEX number',
    'SELECT "Old unique index on number does not exist" as message'
);
PREPARE stmt_drop_old FROM @sql_drop_old;
EXECUTE stmt_drop_old;
DEALLOCATE PREPARE stmt_drop_old;

-- Видалити старий індекс idx_number якщо він UNIQUE (тільки на number)
SET @idx_number_unique = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
        AND TABLE_NAME = 'tables'
        AND INDEX_NAME = 'idx_number'
        AND NON_UNIQUE = 0
        AND COLUMN_NAME = 'number'
        AND (
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
                AND TABLE_NAME = 'tables'
                AND INDEX_NAME = 'idx_number'
        ) = 1
);

SET @sql_drop_idx = IF(@idx_number_unique > 0,
    'ALTER TABLE tables DROP INDEX idx_number',
    'SELECT "idx_number is not a unique single-column index" as message'
);
PREPARE stmt_drop_idx FROM @sql_drop_idx;
EXECUTE stmt_drop_idx;
DEALLOCATE PREPARE stmt_drop_idx;

SELECT '✅ Крок 2: Видалено старі унікальні індекси на number' as status;

-- ============================================
-- КРОК 3: Перевірити чи існує унікальний індекс на (number, client_id)
-- ============================================
SET @unique_index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
        AND TABLE_NAME = 'tables'
        AND INDEX_NAME = 'idx_number_client'
        AND NON_UNIQUE = 0
        AND (
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
                AND TABLE_NAME = 'tables'
                AND INDEX_NAME = 'idx_number_client'
        ) = 2
);

-- ============================================
-- КРОК 4: Створити унікальний індекс на (number, client_id)
-- ============================================
SET @sql_create_unique = IF(@unique_index_exists = 0,
    'ALTER TABLE tables ADD UNIQUE INDEX idx_number_client (number, client_id)',
    'SELECT "Unique index idx_number_client already exists" as message'
);
PREPARE stmt_create_unique FROM @sql_create_unique;
EXECUTE stmt_create_unique;
DEALLOCATE PREPARE stmt_create_unique;

SELECT '✅ Крок 4: Створено унікальний індекс на (number, client_id)' as status;

-- ============================================
-- КРОК 5: Додати звичайний індекс на number (для швидкого пошуку)
-- ============================================
SET @idx_number_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
        AND TABLE_NAME = 'tables'
        AND INDEX_NAME = 'idx_number'
        AND COLUMN_NAME = 'number'
);

SET @sql_idx_number = IF(@idx_number_exists = 0,
    'ALTER TABLE tables ADD INDEX idx_number (number)',
    'SELECT "Index idx_number already exists" as message'
);
PREPARE stmt_idx_number FROM @sql_idx_number;
EXECUTE stmt_idx_number;
DEALLOCATE PREPARE stmt_idx_number;

SELECT '✅ Крок 5: Додано індекс на number' as status;

-- ============================================
-- ПЕРЕВІРКА
-- ============================================
SELECT '✅ ПЕРЕВІРКА ІНДЕКСІВ:' as final_status;

SELECT 
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    CASE WHEN NON_UNIQUE = 0 THEN 'UNIQUE' ELSE 'NON-UNIQUE' END as TYPE,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'bar_kitchen_pos'
    AND TABLE_NAME = 'tables'
    AND (COLUMN_NAME = 'number' OR COLUMN_NAME = 'client_id' OR INDEX_NAME LIKE '%number%' OR INDEX_NAME LIKE '%client%')
GROUP BY INDEX_NAME, NON_UNIQUE, INDEX_TYPE
ORDER BY INDEX_NAME;

-- Показати приклади даних
SELECT '=== Приклади столів ===' as info;
SELECT id, number, client_id FROM tables ORDER BY client_id, number LIMIT 10;


