# 🔌 Backend Integration Guide

## Структура Backend Проекту

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Конфігурація MySQL
│   ├── controllers/
│   │   ├── authController.js    # Авторизація
│   │   ├── productsController.js
│   │   ├── tablesController.js
│   │   ├── ordersController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT перевірка
│   │   └── roleCheck.js         # Перевірка ролей
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Table.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── tables.js
│   │   ├── orders.js
│   │   └── statistics.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── validation.js
│   └── server.js                # Головний файл
├── .env
├── package.json
└── README.md
```

---

## 📦 Необхідні пакети (package.json)

```json
{
  "name": "bar-kitchen-pos-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-validator": "^7.0.1",
    "socket.io": "^4.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🔧 Конфігурація (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bar_kitchen_pos
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 💾 Database Configuration (src/config/database.js)

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Тест з'єднання
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
```

---

## 🔐 Auth Middleware (src/middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleCheck };
```

---

## 🎯 Example Controller (src/controllers/ordersController.js)

```javascript
const db = require('../config/database');

// Отримати всі замовлення
exports.getAllOrders = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = `
      SELECT o.*, u.username as created_by_username
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const [orders] = await db.query(query, params);
    
    // Отримати items для кожного замовлення
    for (let order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      
      // Фільтрувати items по category якщо потрібно
      order.items = category 
        ? items.filter(item => item.category === category)
        : items;
    }
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Створити нове замовлення
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { table_number, comment, items } = req.body;
    const userId = req.user.id;
    
    // Створити замовлення
    const [orderResult] = await connection.query(
      'INSERT INTO orders (table_number, comment, created_by, total_price) VALUES (?, ?, ?, 0)',
      [table_number, comment, userId]
    );
    
    const orderId = orderResult.insertId;
    let totalPrice = 0;
    
    // Додати items
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT name, price, category FROM products WHERE id = ?',
        [item.product_id]
      );
      
      if (product.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, product[0].name, item.quantity, product[0].price, product[0].category]
      );
      
      totalPrice += product[0].price * item.quantity;
    }
    
    // Оновити загальну суму
    await connection.query(
      'UPDATE orders SET total_price = ? WHERE id = ?',
      [totalPrice, orderId]
    );
    
    // Оновити статус столу
    await connection.query(
      'UPDATE tables SET status = ? WHERE number = ?',
      ['occupied', table_number]
    );
    
    await connection.commit();
    
    // Отримати створене замовлення
    const [createdOrder] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    const [orderItems] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    createdOrder[0].items = orderItems;
    
    // Відправити через WebSocket (якщо підключено)
    if (req.app.io) {
      req.app.io.emit('order:created', createdOrder[0]);
    }
    
    res.status(201).json({
      success: true,
      data: createdOrder[0]
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Оновити статус замовлення
exports.updateOrderStatus = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status } = req.body;
    
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Якщо замовлення подано - звільнити стіл
    if (status === 'served') {
      const [order] = await connection.query(
        'SELECT table_number FROM orders WHERE id = ?',
        [id]
      );
      
      await connection.query(
        'UPDATE tables SET status = ? WHERE number = ?',
        ['available', order[0].table_number]
      );
    }
    
    await connection.commit();
    
    // Відправити через WebSocket
    if (req.app.io) {
      req.app.io.emit('order:updated', { id, status });
      
      // Якщо кухня готова і є замовлення для бару - сповістити бар
      if (status === 'ready') {
        const [orderData] = await connection.query(
          'SELECT * FROM orders WHERE id = ?',
          [id]
        );
        const [items] = await connection.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [id]
        );
        
        const hasKitchen = items.some(item => item.category === 'kitchen');
        const hasBar = items.some(item => item.category === 'bar');
        
        if (hasKitchen && hasBar) {
          req.app.io.emit('kitchen:ready', {
            orderId: id,
            tableNumber: orderData[0].table_number
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Order status updated'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
};
```

---

## 🚀 Main Server (src/server.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Додати io до app для доступу в controllers
app.io = io;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/statistics', require('./routes/statistics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
});
```

---

## 🔗 Routes Example (src/routes/orders.js)

```javascript
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Всі routes потребують авторизації
router.use(authMiddleware);

// GET /api/orders
router.get('/', ordersController.getAllOrders);

// GET /api/orders/:id
router.get('/:id', ordersController.getOrderById);

// POST /api/orders (тільки для cashier і admin)
router.post('/', 
  roleCheck(['cashier', 'admin']), 
  ordersController.createOrder
);

// PUT /api/orders/:id/status (для kitchen, bar, admin)
router.put('/:id/status',
  roleCheck(['kitchen', 'bar', 'admin']),
  ordersController.updateOrderStatus
);

module.exports = router;
```

---

## 📝 Інструкція по запуску Backend

### 1. Встановити MySQL
```bash
# Завантажити з https://dev.mysql.com/downloads/mysql/
# Або через Homebrew (Mac):
brew install mysql
brew services start mysql
```

### 2. Створити базу даних
```bash
mysql -u root -p < docs/DATABASE_SCHEMA.sql
```

### 3. Встановити залежності
```bash
cd backend
npm install
```

### 4. Налаштувати .env
Створити файл `.env` та заповнити параметри

### 5. Запустити сервер
```bash
npm run dev
```

Сервер буде доступний на `http://localhost:3001`

---

## ✅ Перевірка роботи

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get products
curl http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```