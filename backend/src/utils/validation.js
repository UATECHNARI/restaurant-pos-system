/**
 * Валідація email
 * @param {String} email - Email для перевірки
 * @returns {Boolean} true якщо email валідний
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валідація пароля
 * @param {String} password - Пароль для перевірки
 * @returns {Object} {valid: Boolean, errors: Array}
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Валідація ролі користувача
 * @param {String} role - Роль для перевірки
 * @returns {Boolean} true якщо роль валідна
 */
export function isValidRole(role) {
  const validRoles = ['admin', 'cashier', 'kitchen', 'bar'];
  return validRoles.includes(role);
}

/**
 * Валідація номеру столу
 * @param {Number} tableNumber - Номер столу
 * @returns {Boolean} true якщо номер валідний
 */
export function isValidTableNumber(tableNumber) {
  return Number.isInteger(tableNumber) && tableNumber > 0 && tableNumber <= 100;
}

/**
 * Валідація ціни
 * @param {Number} price - Ціна для перевірки
 * @returns {Boolean} true якщо ціна валідна
 */
export function isValidPrice(price) {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

/**
 * Валідація статусу замовлення
 * @param {String} status - Статус для перевірки
 * @returns {Boolean} true якщо статус валідний
 */
export function isValidOrderStatus(status) {
  const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * Валідація статусу столу
 * @param {String} status - Статус для перевірки
 * @returns {Boolean} true якщо статус валідний
 */
export function isValidTableStatus(status) {
  const validStatuses = ['available', 'occupied', 'reserved'];
  return validStatuses.includes(status);
}

/**
 * Валідація категорії продукту
 * @param {String} category - Категорія для перевірки
 * @returns {Boolean} true якщо категорія валідна
 */
export function isValidProductCategory(category) {
  const validCategories = ['kitchen', 'bar'];
  return validCategories.includes(category);
}

/**
 * Санітизація введення (видалення небезпечних символів)
 * @param {String} input - Введення для санітизації
 * @returns {String} Санітизоване введення
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Видалити < і >
    .replace(/javascript:/gi, '') // Видалити javascript:
    .replace(/on\w+=/gi, ''); // Видалити event handlers
}

export default {
  isValidEmail,
  validatePassword,
  isValidRole,
  isValidTableNumber,
  isValidPrice,
  isValidOrderStatus,
  isValidTableStatus,
  isValidProductCategory,
  sanitizeInput
};




