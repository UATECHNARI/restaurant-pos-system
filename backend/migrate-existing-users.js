/**
 * Скрипт для міграції існуючих користувачів
 * Створює клієнта для адмінів без client_id
 */

import { query as dbQuery } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateUsers() {
  try {
    console.log('🔄 Початок міграції користувачів...');

    // 1. Знайти всіх адмінів без client_id
    const [admins] = await dbQuery(
      'SELECT * FROM users WHERE role = ? AND (client_id IS NULL OR client_id = 0)',
      ['admin']
    );

    if (admins.length === 0) {
      console.log('✅ Всі адміністратори вже мають client_id');
      return;
    }

    console.log(`📋 Знайдено ${admins.length} адмінів без client_id`);

    for (const admin of admins) {
      // 2. Перевірити чи існує клієнт з таким email
      const [existingClients] = await dbQuery(
        'SELECT * FROM clients WHERE email = ?',
        [admin.email]
      );

      let clientId;

      if (existingClients.length > 0) {
        // Клієнт вже існує - використати його
        clientId = existingClients[0].id;
        console.log(`   ✓ Знайдено існуючий клієнт для ${admin.email}`);
      } else {
        // Створити нового клієнта
        const [clientResult] = await dbQuery(
          'INSERT INTO clients (name, email, status) VALUES (?, ?, ?)',
          [admin.email.split('@')[0] || 'Клієнт', admin.email, 'active']
        );
        clientId = clientResult.insertId;
        console.log(`   ✅ Створено клієнта ID: ${clientId} для ${admin.email}`);
      }

      // 3. Оновити користувача з client_id
      await dbQuery(
        'UPDATE users SET client_id = ? WHERE id = ?',
        [clientId, admin.id]
      );
      console.log(`   ✅ Оновлено користувача ${admin.email} з client_id: ${clientId}`);
    }

    // 4. Оновити користувачів з ролями (kitchen, bar, cashier) - призначити client_id їх адміна
    const [roleUsers] = await dbQuery(
      'SELECT * FROM users WHERE role IN (?, ?, ?) AND (client_id IS NULL OR client_id = 0)',
      ['kitchen', 'bar', 'cashier']
    );

    if (roleUsers.length > 0) {
      console.log(`📋 Знайдено ${roleUsers.length} користувачів з ролями без client_id`);
      
      // Знайти всіх адмінів з client_id
      const [adminsWithClient] = await dbQuery(
        'SELECT id, client_id FROM users WHERE role = ? AND client_id IS NOT NULL',
        ['admin']
      );

      if (adminsWithClient.length === 0) {
        console.log('⚠️  Немає адмінів з client_id для призначення');
        return;
      }

      // Призначити всім користувачам client_id першого адміна (або можна іншу логіку)
      const defaultClientId = adminsWithClient[0].client_id;

      for (const user of roleUsers) {
        await dbQuery(
          'UPDATE users SET client_id = ? WHERE id = ?',
          [defaultClientId, user.id]
        );
        console.log(`   ✅ Оновлено користувача ${user.email} з client_id: ${defaultClientId}`);
      }
    }

    console.log('✅ Міграція завершена успішно!');
    console.log('💡 Перезапустіть backend та перелогіньтесь для отримання нового JWT токену з client_id');

  } catch (error) {
    console.error('❌ Помилка міграції:', error);
    process.exit(1);
  }
}

// Запустити міграцію
migrateUsers().then(() => {
  process.exit(0);
});


