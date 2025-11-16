import jwt from 'jsonwebtoken';

/**
 * Генерує JWT токен
 * @param {Object} payload - Дані для токену (наприклад, {id, role})
 * @param {String} expiresIn - Час життя токену (за замовчуванням з .env)
 * @returns {String} JWT токен
 */
export function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Перевіряє JWT токен
 * @param {String} token - JWT токен
 * @returns {Object} Декодовані дані з токену
 * @throws {Error} Якщо токен недійсний
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Декодує JWT токен без перевірки (небезпечно, використовувати обережно)
 * @param {String} token - JWT токен
 * @returns {Object} Декодовані дані
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  verifyToken,
  decodeToken
};




