import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createPool } from 'mysql2/promise';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const users = [
  { email: 'admin@pizza.com', password: 'password123', role: 'admin' },
  { email: 'cashier@pizza.com', password: 'password123', role: 'cashier' },
  { email: 'kitchen@pizza.com', password: 'password123', role: 'kitchen' },
  { email: 'bar@pizza.com', password: 'password123', role: 'bar' }
];

async function initUsers() {
  try {
    console.log('🔄 Initializing users...');
    console.log('');
    
    const connection = await pool.getConnection();
    
    // Спочатку видаляємо існуючих користувачів (для чистої ініціалізації)
    await connection.query('DELETE FROM users');
    console.log('🗑️  Cleared existing users');
    console.log('');
    
    // Додаємо нових користувачів
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [user.email, hashedPassword, user.role]
      );
      
      console.log(`✅ Created user: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${user.password}`);
      console.log('');
    }
    
    connection.release();
    await pool.end();
    
    console.log('');
    console.log('✅ All users initialized successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('═══════════════════════════════════════════');
    users.forEach(user => {
      console.log(`${user.role.toUpperCase().padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`);
    });
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error initializing users:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('💡 Make sure:');
    console.error('   1. Database exists and is accessible');
    console.error('   2. Users table is created (run database-schema.sql)');
    console.error('   3. .env file has correct credentials');
    console.error('');
    process.exit(1);
  }
}

initUsers();




