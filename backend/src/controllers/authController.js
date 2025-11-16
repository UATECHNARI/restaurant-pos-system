import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query as dbQuery } from '../config/database.js'; // переконайся, що database.js має named export 'query'

// Логін
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await dbQuery('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Включити client_id в токен
    const tokenPayload = { 
      id: user.id, 
      role: user.role,
      client_id: user.client_id || null
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        client_id: user.client_id || null
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Реєстрація - тільки для клієнта (роль admin)
// При реєстрації створюється клієнт (client) та користувач (user) з client_id
// Користувачі з ролями kitchen, bar, cashier створюються через адмін-панель з автогенерацією
export const register = async (req, res) => {
  const { email, password, clientName } = req.body;
  try {
    // Перевірити чи email вже існує
    const [existingUsers] = await dbQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email вже використовується' });
    }

    // Перевірити чи email клієнта вже існує (з обробкою помилки якщо таблиця не існує)
    let existingClients = [];
    try {
      const [result] = await dbQuery('SELECT * FROM clients WHERE email = ?', [email]);
      existingClients = result;
    } catch (err) {
      // Якщо таблиця не існує - створити її
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.error('❌ Таблиця clients не існує! Виконайте SQL скрипт: create-clients-table-only.sql або add-multi-tenancy.sql');
        return res.status(500).json({ 
          message: 'База даних не налаштована. Будь ласка, виконайте SQL скрипт для створення таблиці clients.' 
        });
      }
      throw err;
    }
    
    if (existingClients.length > 0) {
      return res.status(400).json({ message: 'Цей email вже використовується як клієнт' });
    }

    // Хешувати пароль
    const hashed = await bcrypt.hash(password, 10);
    
    // Почати транзакцію (створюємо клієнта та користувача)
    await dbQuery('START TRANSACTION');
    
    try {
      // 1. Створити клієнта
      const [clientResult] = await dbQuery(
        'INSERT INTO clients (name, email, status) VALUES (?, ?, ?)',
        [clientName || email.split('@')[0], email, 'active']
      );
      
      const clientId = clientResult.insertId;
      
      // 2. Створити користувача з client_id
      const [userResult] = await dbQuery(
        'INSERT INTO users (email, password, role, client_id) VALUES (?, ?, ?, ?)',
        [email, hashed, 'admin', clientId]
      );
      
      await dbQuery('COMMIT');
      
      // Генерувати токен з client_id
      const token = jwt.sign(
        { id: userResult.insertId, role: 'admin', client_id: clientId },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      res.status(201).json({ 
        success: true,
        token,
        user: { 
          id: userResult.insertId, 
          email, 
          role: 'admin',
          client_id: clientId
        },
        client: {
          id: clientId,
          name: clientName || email.split('@')[0],
          email
        },
        message: 'Реєстрація успішна! Тепер ви можете увійти в систему.'
      });
    } catch (err) {
      await dbQuery('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Помилка сервера при реєстрації' });
  }
};

// Профіль
export const getProfile = async (req, res) => {
  try {
    const [rows] = await dbQuery(
      'SELECT u.id, u.email, u.role, u.client_id, c.name as client_name, c.status as client_status FROM users u LEFT JOIN clients c ON u.client_id = c.id WHERE u.id = ?', 
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
