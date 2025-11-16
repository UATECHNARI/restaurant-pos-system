/**
 * Middleware для автоматичного визначення client_id з JWT токену
 * Додає req.client_id для використання в контролерах
 */

import { query as dbQuery } from '../config/database.js';

export const getClientId = async (req) => {
  // Отримати client_id з JWT токену (якщо є)
  let clientId = req.user?.client_id;
  
  // Якщо client_id є в JWT - використовуємо його
  if (clientId) {
    console.log('✅ getClientId: client_id from JWT =', clientId);
    return clientId;
  }
  
  // Якщо client_id немає в JWT - спробувати завантажити з БД
  if (req.user?.id) {
    try {
      console.log('🔍 getClientId: Loading client_id from DB for user_id =', req.user.id);
      const [users] = await dbQuery('SELECT client_id FROM users WHERE id = ?', [req.user.id]);
      if (users.length > 0) {
        console.log('📋 getClientId: User found, client_id =', users[0].client_id);
        if (users[0].client_id) {
          clientId = users[0].client_id;
          // Оновити req.user для подальших запитів
          req.user.client_id = clientId;
          console.log('✅ getClientId: client_id loaded from DB =', clientId);
          return clientId;
        } else {
          console.warn('⚠️  getClientId: User exists but client_id is NULL - потрібна міграція');
        }
      } else {
        console.warn('⚠️  getClientId: User not found in DB');
      }
    } catch (error) {
      // Якщо таблиця не існує - не критична помилка, просто повертаємо null
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.error('❌ Таблиця clients не існує! Виконайте SQL скрипт: create-clients-table-only.sql');
      } else {
        console.error('❌ Error loading client_id from DB:', error);
      }
    }
  } else {
    console.warn('⚠️  getClientId: req.user.id is missing');
  }
  
  // Якщо client_id все ще немає - повертаємо null
  console.error('❌ getClientId: client_id is null - user needs to be migrated');
  return null;
};

/**
 * Middleware для валідації client_id
 * Перевіряє чи є client_id у користувача
 */
export const requireClientId = async (req, res, next) => {
  const clientId = await getClientId(req);
  
  if (!clientId) {
    return res.status(403).json({ 
      success: false,
      error: 'Користувач не пов\'язаний з клієнтом. Будь ласка, увійдіть як адміністратор клієнта або виконайте SQL скрипт для оновлення БД.' 
    });
  }
  
  req.client_id = clientId;
  next();
};

/**
 * Middleware для автоматичного додавання client_id до req
 * Не викликає помилку, якщо client_id немає (для гнучкості)
 */
export const addClientId = async (req, res, next) => {
  req.client_id = await getClientId(req);
  next();
};

