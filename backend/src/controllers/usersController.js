import { query as dbQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { generateUniqueLogin, generatePassword } from '../utils/passwordGenerator.js';
import { getClientId } from '../middleware/clientMiddleware.js';

/**
 * Отримати всіх користувачів клієнта (тільки для адміністраторів)
 */
export async function getAllUsers(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { role } = req.query; // Опціональна фільтрація по ролі
    
    let query = 'SELECT id, email, role, client_id, created_at FROM users WHERE client_id = ?';
    const params = [clientId];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY role, created_at DESC';
    
    const [users] = await dbQuery(query, params);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні користувачів'
    });
  }
}

/**
 * Отримати користувача за ID
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    
    const [users] = await dbQuery(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Користувач не знайдений'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні користувача'
    });
  }
}

/**
 * Створити нового користувача з роллю (kitchen, bar, cashier)
 * Логін та пароль генеруються автоматично
 * Користувач створюється з client_id адміна
 */
export async function createUser(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { role } = req.body;
    
    // Перевірити ролі, які можна створювати через цей endpoint
    const allowedRoles = ['kitchen', 'bar', 'cashier'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Неможливо створити користувача з роллю '${role}'. Дозволені ролі: ${allowedRoles.join(', ')}`
      });
    }
    
    // Генерувати унікальний логін та пароль для цього клієнта
    // Перевіряємо унікальність серед користувачів цього клієнта
    let number = 1;
    let email;
    let exists = true;
    
    while (exists) {
      email = `${role}${number}@pizza.com`;
      const [existing] = await dbQuery(
        'SELECT id FROM users WHERE email = ? AND client_id = ?',
        [email, clientId]
      );
      exists = existing.length > 0;
      if (exists) number++;
      if (number > 1000) {
        throw new Error(`Досягнуто максимальну кількість користувачів з роллю ${role} для цього клієнта`);
      }
    }
    
    const password = generatePassword(12);
    
    // Хешувати пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Створити користувача з client_id
    const [result] = await dbQuery(
      'INSERT INTO users (email, password, role, client_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, clientId]
    );
    
    const [newUser] = await dbQuery(
      'SELECT id, email, role, client_id, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    // Повернути користувача з паролем (тільки один раз для показу)
    res.status(201).json({
      success: true,
      data: {
        ...newUser[0],
        password: password // Пароль показується тільки при створенні
      },
      message: `Користувач з роллю '${role}' успішно створений`
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка при створенні користувача'
    });
  }
}

/**
 * Оновити користувача (тільки email)
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Перевірити чи існує користувач
    const [existing] = await dbQuery('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Користувач не знайдений'
      });
    }
    
    // Перевірити чи email вже використовується
    if (email) {
      const [emailCheck] = await dbQuery('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Цей email вже використовується'
        });
      }
    }
    
    // Оновити тільки email (пароль не можна змінювати через цей endpoint)
    if (email) {
      await dbQuery('UPDATE users SET email = ? WHERE id = ?', [email, id]);
    }
    
    const [updatedUser] = await dbQuery(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updatedUser[0],
      message: 'Користувач успішно оновлений'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при оновленні користувача'
    });
  }
}

/**
 * Скинути пароль користувача (згенерувати новий)
 */
export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    
    // Перевірити чи існує користувач
    const [existing] = await dbQuery('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Користувач не знайдений'
      });
    }
    
    // Генерувати новий пароль
    const newPassword = generatePassword(12);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Оновити пароль
    await dbQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    
    const [user] = await dbQuery(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    // Повернути користувача з новим паролем (тільки один раз)
    res.json({
      success: true,
      data: {
        ...user[0],
        password: newPassword // Новий пароль показується тільки при скиданні
      },
      message: 'Пароль успішно скинуто'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при скиданні пароля'
    });
  }
}

/**
 * Видалити користувача
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Перевірити чи існує користувач
    const [existing] = await dbQuery('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Користувач не знайдений'
      });
    }
    
    // Не можна видалити себе
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Не можна видалити власний обліковий запис'
      });
    }
    
    // Видалити користувача
    await dbQuery('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Користувач успішно видалений'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при видаленні користувача'
    });
  }
}

