# 📡 API Documentation - Bar & Kitchen POS System

## Base URL
```
http://localhost:3001/api
```

---

## 🔐 Authentication

### POST /auth/login
Авторизація користувача

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Ролі:** `admin`, `cashier`, `kitchen`, `bar`

---

## 👥 Users

### GET /users
Отримати всіх користувачів (тільки для admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /users
Створити нового користувача (тільки для admin)

**Request Body:**
```json
{
  "username": "cashier1",
  "password": "password123",
  "role": "cashier"
}
```

---

## 🍕 Products (Товари)

### GET /products
Отримати всі товари

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Маргарита",
      "category": "kitchen",
      "price": 150,
      "image": null,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /products
Створити новий товар (admin only)

**Request Body:**
```json
{
  "name": "Маргарита",
  "category": "kitchen",
  "price": 150,
  "image": null
}
```

**Categories:** `kitchen`, `bar`, `drinks`, `desserts`

### PUT /products/:id
Оновити товар (admin only)

**Request Body:**
```json
{
  "name": "Маргарита Premium",
  "category": "kitchen",
  "price": 180,
  "image": null
}
```

### DELETE /products/:id
Видалити товар (admin only)

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🪑 Tables (Столи)

### GET /tables
Отримати всі столи

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "number": 1,
      "seats": 4,
      "status": "available",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Statuses:** `available`, `occupied`

### POST /tables
Створити новий стіл (admin only)

**Request Body:**
```json
{
  "number": 10,
  "seats": 6
}
```

### PUT /tables/:id
Оновити стіл (admin only)

**Request Body:**
```json
{
  "number": 10,
  "seats": 8,
  "status": "available"
}
```

### DELETE /tables/:id
Видалити стіл (admin only)

---

## 📋 Orders (Замовлення)

### GET /orders
Отримати всі замовлення

**Query Parameters:**
- `status` (optional): `accepted`, `preparing`, `ready`, `served`
- `category` (optional): `kitchen`, `bar`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "table_number": 5,
      "comment": "Без цибулі",
      "status": "accepted",
      "total_price": 350,
      "created_at": "2024-01-01T12:30:00Z",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "product_name": "Маргарита",
          "quantity": 2,
          "price": 150,
          "category": "kitchen"
        }
      ]
    }
  ]
}
```

### GET /orders/:id
Отримати конкретне замовлення

### POST /orders
Створити нове замовлення (cashier)

**Request Body:**
```json
{
  "table_number": 5,
  "comment": "Без цибулі",
  "items": [
    {
      "product_id": 1,
      "product_name": "Маргарита",
      "quantity": 2,
      "price": 150,
      "category": "kitchen"
    },
    {
      "product_id": 5,
      "product_name": "Мохіто",
      "quantity": 1,
      "price": 80,
      "category": "bar"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "table_number": 5,
    "comment": "Без цибулі",
    "status": "accepted",
    "total_price": 380,
    "created_at": "2024-01-01T12:30:00Z",
    "items": [...]
  }
}
```

### PUT /orders/:id/status
Оновити статус замовлення (kitchen/bar)

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Statuses flow:**
- `accepted` → `preparing` → `ready` → `served`

---

## 📊 Statistics (Статистика)

### GET /statistics/dashboard
Отримати статистику для dashboard (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "active_orders": 15,
    "kitchen_orders": 8,
    "bar_orders": 7,
    "today_revenue": 12500,
    "total_products": 45,
    "available_tables": 6,
    "occupied_tables": 2
  }
}
```

### GET /statistics/revenue
Отримати статистику доходів (admin only)

**Query Parameters:**
- `period`: `today`, `week`, `month`, `year`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "total_revenue": 12500,
    "orders_count": 45,
    "average_check": 278
  }
}
```

---

## 🔄 WebSocket Events (Real-time)

Для реального часу можна використовувати WebSocket:

### Connection
```javascript
const socket = io('http://localhost:3001');
```

### Events to Listen:
- `order:created` - Нове замовлення створено
- `order:updated` - Замовлення оновлено
- `table:updated` - Статус столу змінено
- `kitchen:ready` - Кухня завершила замовлення (тригерує голосове сповіщення в барі)

**Example:**
```javascript
socket.on('order:created', (order) => {
  console.log('New order:', order);
  // Оновити список замовлень
});

socket.on('kitchen:ready', (data) => {
  console.log('Kitchen ready for table:', data.tableNumber);
  // Відтворити голосове сповіщення в барі
  speakNotification(`Замовлення стіл ${data.tableNumber} готове на кухні`);
});
```

### Events to Emit:
- `order:statusChange` - Зміна статусу замовлення

---

## 🚨 Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request data"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📝 Notes

- Всі дати в форматі ISO 8601 (UTC)
- Всі ціни в гривнях (UAH)
- Token має термін дії 24 години
- Rate limit: 100 requests/minute