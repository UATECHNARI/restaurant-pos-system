# 🚀 Повна інструкція по розгортанню Bar & Kitchen POS System

## 📚 Зміст

1. [Передумови](#передумови)
2. [Встановлення MySQL](#встановлення-mysql)
3. [Налаштування бази даних](#налаштування-бази-даних)
4. [Створення Backend проекту](#створення-backend-проекту)
5. [Підключення Frontend до Backend](#підключення-frontend-до-backend)
6. [Запуск системи](#запуск-системи)
7. [Розгортання на production](#розгортання-на-production)

---

## Передумови

Перед початком переконайтеся що встановлено:

- ✅ **Node.js** (v16 або новіше) - [Завантажити](https://nodejs.org/)
- ✅ **MySQL** (v8.0 або новіше) - [Завантажити](https://dev.mysql.com/downloads/mysql/)
- ✅ **Git** - [Завантажити](https://git-scm.com/)
- ✅ **VSCode** або інший редактор коду

### Перевірка встановлення:

```bash
node --version    # Має показати v16.x.x або вище
npm --version     # Має показати 8.x.x або вище
mysql --version   # Має показати 8.x.x або вище
```

---

## Встановлення MySQL

### Windows

1. Завантажити MySQL Installer з [офіційного сайту](https://dev.mysql.com/downloads/installer/)
2. Запустити інсталятор та обрати "Developer Default"
3. Під час встановлення задати root пароль (запам'ятайте його!)
4. Завершити встановлення

### macOS

```bash
# Через Homebrew
brew install mysql
brew services start mysql

# Задати root пароль
mysql_secure_installation
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

---

## Налаштування бази даних

### 1. Підключитися до MySQL

```bash
mysql -u root -p
# Ввести пароль який задали при встановленні
```

### 2. Створити базу даних та користувача

```sql
-- Створити базу даних
CREATE DATABASE bar_kitchen_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Створити користувача (замініть 'your_password' на надійний пароль)
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'your_password';

-- Надати права
GRANT ALL PRIVILEGES ON bar_kitchen_pos.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;

-- Вийти
EXIT;
```

### 3. Імпортувати схему бази даних

Перейдіть в папку з проектом та виконайте:

```bash
mysql -u pos_user -p bar_kitchen_pos < docs/DATABASE_SCHEMA.sql
# Ввести пароль користувача pos_user
```

### 4. Перевірити що таблиці створені

```bash
mysql -u pos_user -p bar_kitchen_pos

# В MySQL консолі:
SHOW TABLES;
# Має показати: users, products, tables, orders, order_items, activity_logs

# Перевірити дані:
SELECT * FROM products;
SELECT * FROM tables;

EXIT;
```

---

## Створення Backend проекту

### 1. Створити папку для backend

```bash
# В корені проекту створити папку backend
mkdir backend
cd backend
```

### 2. Ініціалізувати Node.js проект

```bash
npm init -y
```

### 3. Встановити залежності

```bash
npm install express mysql2 dotenv bcryptjs jsonwebtoken cors helmet express-validator socket.io

npm install --save-dev nodemon
```

### 4. Створити структуру проекту

```bash
mkdir -p src/config src/controllers src/middleware src/models src/routes src/utils
```

### 5. Створити файл package.json

Відредагувати `package.json` та додати scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 6. Створити .env файл

```bash
# В папці backend створити файл .env
touch .env
```

Відкрити `.env` та додати:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=pos_user
DB_PASSWORD=your_password
DB_NAME=bar_kitchen_pos
DB_PORT=3306

JWT_SECRET=change_this_to_random_string_in_production_abc123xyz789
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5173
```

**⚠️ ВАЖЛИВО:** Замініть `your_password` на реальний пароль від MySQL!

### 7. Скопіювати код з документації

Створити файли за прикладами з `docs/BACKEND_INTEGRATION.md`:

- `src/config/database.js`
- `src/middleware/auth.js`
- `src/controllers/ordersController.js` (та інші контролери)
- `src/routes/orders.js` (та інші роути)
- `src/server.js`

### 8. Згенерувати хеш пароля для користувачів

Створити файл `scripts/hashPassword.js`:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

hashPassword('password123');
```

Запустити:

```bash
node scripts/hashPassword.js
```

Скопіювати згенерований hash та оновити в базі даних:

```sql
UPDATE users SET password_hash = 'YOUR_GENERATED_HASH' WHERE username = 'admin';
```

### 9. Запустити backend

```bash
npm run dev
```

Має з'явитися:

```
🚀 Server running on port 3001
📡 WebSocket ready
✅ MySQL connected successfully
```

---

## Підключення Frontend до Backend

### 1. Встановити залежності

В корені frontend проекту:

```bash
npm install socket.io-client
```

### 2. Створити .env файл

В корені frontend (там де App.tsx):

```bash
touch .env
```

Додати:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 3. Створити API service

Створити файли за прикладами з `docs/FRONTEND_API_SERVICE.md`:

- `src/services/api.ts`
- `src/services/websocket.ts`

### 4. Оновити App.tsx

Замінити useState з початковими даними на виклики API (див. приклад в документації)

---

## Запуск системи

### Запуск в режимі розробки

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### Відкрити в браузері

```
http://localhost:5173
```

### Тестові користувачі

| Username  | Password    | Role    |
|-----------|-------------|---------|
| admin     | password123 | admin   |
| cashier1  | password123 | cashier |
| kitchen1  | password123 | kitchen |
| bar1      | password123 | bar     |

---

## Розгортання на production

### 1. Підготовка Backend

```bash
# Build production
NODE_ENV=production npm start

# Або через PM2 (рекомендовано)
npm install -g pm2
pm2 start src/server.js --name pos-backend
pm2 save
pm2 startup
```

### 2. Підготовка Frontend

```bash
# Build для production
npm run build

# Файли будуть в папці dist/
# Розмістити на веб-сервері (Nginx, Apache) або Vercel/Netlify
```

### 3. Налаштування Nginx (приклад)

```nginx
# Backend proxy
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pos-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. SSL сертифікат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

## 🔧 Налаштування безпеки

### MySQL

```sql
-- Обмежити доступ тільки з localhost
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Регулярно робити backup
mysqldump -u pos_user -p bar_kitchen_pos > backup_$(date +%Y%m%d).sql
```

### Backend

- ✅ Використовувати HTTPS в production
- ✅ Змінити JWT_SECRET на випадковий рядок
- ✅ Встановити rate limiting (express-rate-limit)
- ✅ Валідувати всі вхідні дані
- ✅ Логувати всі важливі операції

### Frontend

- ✅ Не зберігати чутливі дані в localStorage
- ✅ Використовувати HTTPS
- ✅ Встановити Content Security Policy

---

## 📊 Моніторинг та логи

### PM2 Dashboard

```bash
pm2 monit
pm2 logs pos-backend
```

### MySQL Logs

```bash
sudo tail -f /var/log/mysql/error.log
```

---

## ❓ Troubleshooting

### Backend не запускається

1. Перевірити чи запущений MySQL: `sudo service mysql status`
2. Перевірити .env файл - правильні credentials?
3. Перевірити чи порт 3001 не зайнятий: `lsof -i :3001`

### Frontend не підключається до Backend

1. Перевірити CORS в backend (додати frontend URL)
2. Перевірити .env файл у frontend
3. Відкрити Developer Console → Network tab

### Помилки авторизації

1. Перевірити чи правильно згенеровані хеші паролів
2. Перевірити JWT_SECRET в .env
3. Очистити localStorage та спробувати знову

---

## 📞 Підтримка

Якщо виникли проблеми:

1. Перевірити логи backend: `npm run dev`
2. Перевірити консоль браузера (F12)
3. Перевірити чи всі таблиці створені в MySQL
4. Перевірити чи всі залежності встановлені

---

## 🎉 Готово!

Тепер у вас повноцінна POS система з backend та базою даних!

**Наступні кроки:**

1. Налаштувати резервне копіювання бази даних
2. Додати моніторинг (Grafana, Prometheus)
3. Налаштувати CI/CD (GitHub Actions)
4. Створити мобільну версію
