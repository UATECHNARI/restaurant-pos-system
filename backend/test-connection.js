import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('Configuration:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log('');
    
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('✅ Test query successful:', rows[0]);
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    connection.release();
    await pool.end();
    
    console.log('');
    console.log('✅ All checks passed! Database is ready.');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Database connection error:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if MySQL is running');
    console.error('   2. Verify .env file exists with correct credentials');
    console.error('   3. Ensure database exists: CREATE DATABASE bar_kitchen_pos;');
    console.error('   4. Check MySQL user has proper permissions');
    console.error('');
    process.exit(1);
  }
}

testConnection();




