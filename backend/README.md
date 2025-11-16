# 🍕 Pizza POS Backend

Backend для системи управління рестораном/баром з підтримкою WebSocket, REST API та автентифікації.

## 📋 Зміст

- [Технології](#технології)
- [Вимоги](#вимоги)
- [Встановлення](#встановлення)
- [Конфігурація](#конфігурація)
- [Запуск](#запуск)
- [API Документація](#api-документація)
- [WebSocket Events](#websocket-events)
- [Структура проекту](#структура-проекту)

## 🛠 Технології

- **Node.js** v18+ з ES Modules
- **Express.js** - веб-фреймворк
- **MySQL 8.0** - база даних
- **Socket.IO** - WebSocket для real-time оновлень
- **JWT** - автентифікація
- **bcryptjs** - хешування паролів
- **Helmet** - безпека headers
- **CORS** - підтримка cross-origin запитів

## 📦 Вимоги

Перед встановленням переконайтеся, що у вас встановлено:

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0

## 🚀 Встановлення

### 1. Клонувати репозиторій і перейти до папки backend

```bash
cd backend
```

### 2. Встановити залежності

```bash
npm install
```

### 3. Налаштувати MySQL базу даних

```bash
# Увійти в MySQL
mysql -u root -p

# Створити базу даних та імпортувати схему
mysql -u root -p < database-schema.sql
```

### 4. Налаштувати змінні середовища

Скопіюйте файл `.env.example` як `.env`:

```bash
cp .env.example .env
```

Відредагуйте `.env` файл зі своїми налаштуваннями:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bar_kitchen_pos
DB_PORT=3306

JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5173
```

> **⚠️ ВАЖЛИВО:** Для production обов'язково використовуйте сильні паролі та секретні ключі!

### 5. Згенерувати сильний JWT_SECRET (опціонально)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## ▶️ Запуск

### Development режим (з nodemon)

```bash
npm run dev
```

### Production режим

```bash
npm start
```

Сервер буде доступний на `http://localhost:3001`

## 📚 API Документація

### Базовий URL

```
http://localhost:3001/api
```

### 🔐 Автентифікація

Всі endpoints (окрім `/auth/login` та `/auth/register`) потребують JWT токен у header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Auth Routes (`/api/auth`)

#### POST `/api/auth/register`
Реєстрація нового користувача

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "cashier"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "cashier"
}
```

---

#### POST `/api/auth/login`
Вхід користувача

**Body:**
```json
{
  "email": "admin@pizza.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@pizza.com",
    "role": "admin"
  }
}
```

---

#### GET `/api/auth/profile`
Отримати профіль поточного користувача

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "id": 1,
  "email": "admin@pizza.com",
  "role": "admin"
}
```

---

### Products Routes (`/api/products`)

#### GET `/api/products`
Отримати всі продукти

**Query params:**
- `category` (optional): `kitchen` | `bar`
- `available` (optional): `true` | `false`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Піца Маргарита",
      "category": "kitchen",
      "price": 150.00,
      "description": "Томатний соус, моцарела, базилік",
      "image_url": null,
      "available": true
    }
  ]
}
```

---

#### GET `/api/products/:id`
Отримати продукт за ID

---

#### POST `/api/products` (Admin only)
Створити новий продукт

**Body:**
```json
{
  "name": "Нова піца",
  "category": "kitchen",
  "price": 200.00,
  "description": "Опис",
  "image_url": "https://example.com/image.jpg",
  "available": true
}
```

---

#### PUT `/api/products/:id` (Admin only)
Оновити продукт

---

#### DELETE `/api/products/:id` (Admin only)
Видалити продукт

---

#### PATCH `/api/products/:id/toggle` (Admin only)
Перемкнути доступність продукту

---

### Tables Routes (`/api/tables`)

#### GET `/api/tables`
Отримати всі столи

**Query params:**
- `status` (optional): `available` | `occupied` | `reserved`

---

#### GET `/api/tables/:number`
Отримати стіл за номером

---

#### POST `/api/tables` (Admin only)
Створити новий стіл

**Body:**
```json
{
  "number": 11,
  "capacity": 4,
  "status": "available"
}
```

---

#### PUT `/api/tables/:number/status` (Cashier, Admin)
Оновити статус столу

**Body:**
```json
{
  "status": "occupied"
}
```

---

#### DELETE `/api/tables/:number` (Admin only)
Видалити стіл

---

### Orders Routes (`/api/orders`)

#### GET `/api/orders`
Отримати всі замовлення

**Query params:**
- `status` (optional): `pending` | `preparing` | `ready` | `served` | `cancelled`
- `category` (optional): `kitchen` | `bar` - фільтрує items в замовленні

---

#### GET `/api/orders/:id`
Отримати замовлення за ID

---

#### POST `/api/orders` (Cashier, Admin)
Створити нове замовлення

**Body:**
```json
{
  "table_number": 5,
  "comment": "Без цибулі",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 7,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "table_number": 5,
    "comment": "Без цибулі",
    "status": "pending",
    "total_price": 380.00,
    "items": [...]
  }
}
```

---

#### PUT `/api/orders/:id/status` (Kitchen, Bar, Admin)
Оновити статус замовлення

**Body:**
```json
{
  "status": "preparing"
}
```

**Statuses:** `pending` → `preparing` → `ready` → `served` або `cancelled`

---

### Statistics Routes (`/api/statistics`) (Admin only)

#### GET `/api/statistics/dashboard`
Загальна статистика для дашборду

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "orders_count": 45,
      "revenue": 6750.00,
      "avg_order": 150.00
    },
    "activeOrders": 12,
    "tables": [
      { "status": "available", "count": 7 },
      { "status": "occupied", "count": 3 }
    ],
    "topProduct": {
      "product_name": "Піца Маргарита",
      "quantity": 28
    }
  }
}
```

---

#### GET `/api/statistics/sales`
Статистика продажів

**Query params:**
- `period`: `today` | `week` | `month` | `year`

---

#### GET `/api/statistics/orders-timeline`
Хронологія замовлень

**Query params:**
- `period`: `day` | `week` | `month`

---

#### GET `/api/statistics/tables`
Статистика столів

---

#### GET `/api/statistics/staff`
Статистика працівників

**Query params:**
- `period`: `today` | `week` | `month`

---

## 🔌 WebSocket Events

### Підключення

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Events

#### `order:created`
Відправляється при створенні нового замовлення

```javascript
socket.on('order:created', (order) => {
  console.log('New order:', order);
});
```

#### `order:updated`
Відправляється при оновленні статусу замовлення

```javascript
socket.on('order:updated', ({ id, status }) => {
  console.log(`Order ${id} status: ${status}`);
});
```

#### `kitchen:ready`
Відправляється коли кухня готова (для барів із змішаними замовленнями)

```javascript
socket.on('kitchen:ready', ({ orderId, tableNumber }) => {
  console.log(`Kitchen ready for table ${tableNumber}`);
});
```

#### `table:updated`
Відправляється при оновленні статусу столу

```javascript
socket.on('table:updated', (table) => {
  console.log('Table updated:', table);
});
```

---

## 📁 Структура проекту

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Конфігурація MySQL
│   ├── controllers/
│   │   ├── authController.js    # Контролер автентифікації
│   │   ├── ordersController.js  # Контролер замовлень
│   │   ├── productsController.js
│   │   ├── tableController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── roleCheck.js         # Перевірка ролей
│   ├── models/                  # (опціонально для майбутніх моделей)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   ├── tables.js
│   │   └── statistics.js
│   ├── utils/
│   │   ├── jwt.js               # JWT утиліти
│   │   └── validation.js        # Валідація даних
│   └── server.js                # Головний файл
├── database-schema.sql          # SQL схема
├── .env.example                 # Приклад конфігурації
├── .gitignore
├── package.json
└── README.md
```

---

## 🔒 Ролі користувачів

| Роль | Права доступу |
|------|---------------|
| **admin** | Повний доступ до всіх endpoints |
| **cashier** | Створення замовлень, управління столами |
| **kitchen** | Перегляд та оновлення статусу замовлень (тільки kitchen items) |
| **bar** | Перегляд та оновлення статусу замовлень (тільки bar items) |

---

## 🧪 Тестування

### Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### Тестовий логін

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pizza.com",
    "password": "password123"
  }'
```

---

## 🐛 Debugging

### Увімкнути debug логи

У файлі `.env`:

```env
NODE_ENV=development
DEBUG=*
```

### Перевірити з'єднання з базою даних

```bash
npm run dev
```

Перевірте консоль на повідомлення:
```
✅ MySQL connected successfully
```

---

## 🚀 Production Deploy

### 1. Налаштувати production базу даних

### 2. Оновити .env для production

```env
NODE_ENV=production
DB_HOST=your-production-db-host
JWT_SECRET=your-strong-secret-key
FRONTEND_URL=https://your-production-domain.com
```

### 3. Встановити PM2 (рекомендовано)

```bash
npm install -g pm2
pm2 start src/server.js --name pizza-backend
pm2 save
pm2 startup
```

---

## 📝 Ліцензія

ISC

## 👨‍💻 Автор

Pizza POS System Backend Team

---

## 📞 Підтримка

Якщо у вас виникли питання або проблеми, створіть Issue в репозиторії.




