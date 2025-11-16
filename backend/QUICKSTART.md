# 🚀 Quick Start Guide

## Швидкий запуск за 5 хвилин

### ✅ Передумови

Переконайтеся, що встановлено:
- Node.js 18+
- MySQL 8.0+
- npm 9+

---

## 📝 Крок 1: Встановлення залежностей

```bash
cd backend
npm install
```

---

## 🗄️ Крок 2: Налаштування MySQL

### 2.1 Створити базу даних

```bash
# Увійти в MySQL
mysql -u root -p

# Виконати в MySQL консолі:
CREATE DATABASE bar_kitchen_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2.2 Імпортувати схему

```bash
mysql -u root -p bar_kitchen_pos < database-schema.sql
```

---

## ⚙️ Крок 3: Налаштування .env

### 3.1 Створити файл .env

```bash
# Windows PowerShell
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 3.2 Відредагувати .env

Відкрийте `.env` та змініть:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD    # ⚠️ Змініть це!
DB_NAME=bar_kitchen_pos
DB_PORT=3306

JWT_SECRET=change_this_to_random_32_character_string    # ⚠️ Змініть це!
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5173
```

---

## ✅ Крок 4: Перевірка з'єднання

```bash
npm run test:db
```

Очікуваний результат:
```
✅ MySQL connection successful!
✅ Test query successful
📋 Available tables:
  - users
  - products
  - tables
  - orders
  - order_items
✅ All checks passed!
```

---

## 👥 Крок 5: Ініціалізація користувачів

```bash
npm run init:users
```

Це створить тестових користувачів:
- `admin@pizza.com` / `password123`
- `cashier@pizza.com` / `password123`
- `kitchen@pizza.com` / `password123`
- `bar@pizza.com` / `password123`

---

## 🚀 Крок 6: Запуск сервера

### Development режим (з автоперезавантаженням)

```bash
npm run dev
```

### Production режим

```bash
npm start
```

---

## ✅ Крок 7: Тестування API

### 7.1 Health Check

```bash
curl http://localhost:3001/health
```

Очікувана відповідь:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### 7.2 Тест логіну

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@pizza.com\",\"password\":\"password123\"}"
```

Очікувана відповідь:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@pizza.com",
    "role": "admin"
  }
}
```

---

## 🎉 Готово!

Ваш backend працює на `http://localhost:3001`

### Наступні кроки:

1. **Тестування API** - використовуйте Postman або Thunder Client
2. **Підключити Frontend** - налаштуйте FRONTEND_URL у .env
3. **Дивіться документацію** - читайте [README.md](README.md)

---

## 🐛 Типові проблеми

### ❌ "MySQL connection error"

**Рішення:**
1. Перевірте, що MySQL запущений: `mysql --version`
2. Перевірте credentials в `.env`
3. Перевірте, що база даних існує:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

---

### ❌ "EADDRINUSE: address already in use"

**Рішення:**
- Порт 3001 вже зайнятий. Змініть PORT в `.env` або зупиніть інший процес:

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3001 | xargs kill
```

---

### ❌ "Cannot find module"

**Рішення:**
```bash
rm -rf node_modules
npm install
```

---

### ❌ "Invalid or expired token"

**Рішення:**
- Перелогіньтеся для отримання нового токену
- Перевірте, що JWT_SECRET однаковий між запусками

---

## 📚 Додаткова інформація

- **Повна документація:** [README.md](README.md)
- **API Endpoints:** Дивіться розділ API в README.md
- **WebSocket Events:** Дивіться розділ WebSocket в README.md

---

## 💡 Корисні команди

```bash
# Перевірка з'єднання з БД
npm run test:db

# Переініціалізація користувачів
npm run init:users

# Запуск з debug логами
DEBUG=* npm run dev

# Перевірка порту
netstat -ano | findstr :3001    # Windows
lsof -i :3001                   # Linux/Mac
```

---

## 🔐 Безпека

⚠️ **ВАЖЛИВО для Production:**

1. Змініть всі паролі користувачів
2. Використайте сильний JWT_SECRET (мінімум 32 символи)
3. Налаштуйте HTTPS
4. Налаштуйте firewall
5. Використовуйте змінні середовища (не .env файл)
6. Регулярно оновлюйте залежності: `npm audit fix`

---

**Успіхів! 🚀**




