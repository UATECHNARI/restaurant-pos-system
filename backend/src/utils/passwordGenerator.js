/**
 * Утиліти для генерації логінів та паролів для користувачів з ролями
 */

/**
 * Генерує випадковий пароль
 * @param {number} length - Довжина пароля (за замовчуванням 12)
 * @returns {string} - Згенерований пароль
 */
export function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  
  // Гарантуємо, що є хоча б одна велика літера, одна мала літера та одна цифра
  password += charset[Math.floor(Math.random() * 26)]; // мала літера
  password += charset[Math.floor(Math.random() * 26) + 26]; // велика літера
  password += charset[Math.floor(Math.random() * 10) + 52]; // цифра
  
  // Додаємо випадкові символи до потрібної довжини
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Перемішуємо символи
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Генерує логін для користувача на основі ролі
 * @param {string} role - Роль користувача (kitchen, bar, cashier)
 * @param {number} number - Номер користувача (для унікальності)
 * @returns {string} - Згенерований логін
 */
export function generateLogin(role, number = 1) {
  const rolePrefix = {
    'kitchen': 'kitchen',
    'bar': 'bar',
    'cashier': 'cashier'
  };
  
  const prefix = rolePrefix[role] || 'user';
  return `${prefix}${number}@pizza.com`;
}

/**
 * Перевіряє чи існує логін в базі даних
 * @param {Function} dbQuery - Функція запиту до БД
 * @param {string} email - Email для перевірки
 * @returns {Promise<boolean>} - true якщо логін існує
 */
export async function checkLoginExists(dbQuery, email) {
  try {
    const [rows] = await dbQuery('SELECT id FROM users WHERE email = ?', [email]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking login existence:', error);
    throw error;
  }
}

/**
 * Генерує унікальний логін для ролі
 * @param {Function} dbQuery - Функція запиту до БД
 * @param {string} role - Роль користувача
 * @returns {Promise<string>} - Унікальний логін
 */
export async function generateUniqueLogin(dbQuery, role) {
  let number = 1;
  let email = generateLogin(role, number);
  
  // Шукаємо перший вільний номер
  while (await checkLoginExists(dbQuery, email)) {
    number++;
    email = generateLogin(role, number);
    
    // Захист від зациклення (максимум 1000 користувачів одного типу)
    if (number > 1000) {
      throw new Error(`Досягнуто максимальну кількість користувачів з роллю ${role}`);
    }
  }
  
  return email;
}


