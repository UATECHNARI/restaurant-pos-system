# 🍕 Bar & Kitchen POS System

Повноцінна система управління для ресторану з темною темою, управлінням столами, замовленнями та розподілом ролей.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Node.js](https://img.shields.io/badge/Node.js-16.x-green)

---

## ✨ Особливості

### 🎨 Інтерфейс
- ⚫ Темна тема з акцентними кольорами
- 📱 Адаптивний дизайн для планшетів
- 🖱️ Великі кнопки для сенсорних екранів
- 🎯 Інтуїтивний UX

### 👥 Ролі користувачів
- 👑 **Адміністратор** - Dashboard, управління товарами та столами
- 💰 **Касир** - POS-інтерфейс, створення замовлень
- 👨‍🍳 **Кухня** - Перегляд та обробка замовлень для кухні
- 🍹 **Бар** - Перегляд та обробка замовлень для бару

### 📋 Функціонал
- ✅ Управління товарами (CRUD)
- ✅ Управління столами (CRUD)
- ✅ Створення та відстеження замовлень
- ✅ Статуси замовлень (Прийнято → Готується → Готово → Подано)
- ✅ Друк чеків
- ✅ Коментарі до замовлень
- ✅ Статистика для адміна
- ✅ Real-time оновлення через WebSocket
- ✅ **Голосові сповіщення** - коли кухня готова, бар отримує голосове повідомлення
- ✅ **Візуальні індикатори** - яскраві позначки про готовність замовлень з кухні

---

## 🏗️ Архітектура

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS v4** для стилів
- **shadcn/ui** компоненти
- **Socket.io Client** для real-time оновлень

### Backend
- **Node.js** + **Express**
- **MySQL** база даних
- **JWT** авторизація
- **Socket.io** для WebSocket
- **bcrypt** для хешування паролів

---

## 📁 Структура проекту

```
bar-kitchen-pos/
├── docs/                          # Документація
│   ├── API_DOCUMENTATION.md       # API endpoints
│   ├── DATABASE_SCHEMA.sql        # SQL схема бази даних
│   ├── BACKEND_INTEGRATION.md     # Інтеграція backend
│   ├── FRONTEND_API_SERVICE.md    # Frontend API service
│   └── SETUP_INSTRUCTIONS.md      # Повна інструкція
├── src/
│   ├── components/                # React компоненти
│   │   ├── LoginScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── POSScreen.tsx
│   │   ├── KitchenScreen.tsx
│   │   ├── BarScreen.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── TableManagement.tsx
│   │   └── ui/                    # shadcn/ui компоненти
│   ├── services/                  # API та WebSocket services
│   │   ├── api.ts                 # (створити після налаштування)
│   │   └── websocket.ts           # (створити після налаштування)
│   ├── utils/
│   │   └── printReceipt.ts        # Функція друку чеків
│   ├── styles/
│   │   └── globals.css
│   └── App.tsx                    # Головний компонент
├── backend/                       # (створити окремо)
│   └── (див. BACKEND_INTEGRATION.md)
└── README.md
```

---

## 🚀 Швидкий старт

### 1. Frontend (Поточний проект)

```bash
# Встановити залежності
npm install

# Запустити в режимі розробки
npm run dev
```

Frontend буде доступний на `http://localhost:5173`

**Поточний режим:** Працює з локальним станом (localStorage) без backend.

### 2. Backend + База даних (Опціонально)

Для повноцінної роботи з базою даних MySQL та backend API:

📖 **Детальні інструкції:** [`docs/SETUP_INSTRUCTIONS.md`](docs/SETUP_INSTRUCTIONS.md)

**Короткий гайд:**

1. Встановити MySQL
2. Створити базу даних: `mysql -u root -p < docs/DATABASE_SCHEMA.sql`
3. Створити backend проект (див. документацію)
4. Підключити frontend до backend

---

## 📚 Документація

| Документ | Опис |
|----------|------|
| [API Documentation](docs/API_DOCUMENTATION.md) | Всі API endpoints з прикладами |
| [Database Schema](docs/DATABASE_SCHEMA.sql) | SQL схема для MySQL |
| [Backend Integration](docs/BACKEND_INTEGRATION.md) | Приклади коду для backend |
| [Frontend API Service](docs/FRONTEND_API_SERVICE.md) | Інтеграція API у frontend |
| [Setup Instructions](docs/SETUP_INSTRUCTIONS.md) | Повна інструкція по розгортанню |
| [Voice Notifications](docs/VOICE_NOTIFICATIONS.md) | Голосові сповіщення - налаштування та використання |

---

## 🎨 Дизайн система

### Кольори

```css
Фон:              #1a1a1a (темно-сірий)
Картки:           #2a2a2a (сірий)
Текст:            #ffffff (білий)
Акценти:
  - Готово:       #4CAF50 (зелений)
  - Готується:    #FF9800 (помаранчевий)  
  - Відміна:      #F44336 (червоний)
  - Дії касира:   #2196F3 (голубий)
```

### Шрифти
- **Inter** або **SF Pro Display**
- Великі розміри для сенсорних екранів

---

## 👤 Тестові користувачі

При роботі з backend (після створення бази даних):

| Логін    | Пароль      | Роль    |
|----------|-------------|---------|
| admin    | password123 | Адмін   |
| cashier1 | password123 | Касир   |
| kitchen1 | password123 | Кухня   |
| bar1     | password123 | Бар     |

**⚠️ ВАЖЛИВО:** Змініть паролі перед використанням у production!

---

## 🛠️ Технології

### Frontend
- React 18
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React (іконки)
- Socket.io Client

### Backend (опціонально)
- Node.js
- Express
- MySQL
- JWT (jsonwebtoken)
- bcryptjs
- Socket.io

---

## 📦 Доступні команди

```bash
# Розробка
npm run dev          # Запустити dev сервер

# Production
npm run build        # Збілдити для production
npm run preview      # Попередній перегляд build

# Linting
npm run lint         # Перевірити код
```

---

## 🔐 Безпека

- 🔒 JWT авторизація
- 🔒 Хешування паролів (bcrypt)
- 🛡️ Row Level Security в базі даних
- 🚫 CORS налаштування
- ✅ Валідація вхідних даних
- 📝 Логування дій користувачів

---

## 📊 Можливості розширення

- [ ] Інтеграція з фіскальним принтером
- [ ] Мобільний додаток (React Native)
- [ ] Аналітика та звіти
- [ ] Інтеграція з платіжними системами
- [ ] Програма лояльності
- [ ] QR-меню для гостей
- [ ] Інвентаризація та склад
- [ ] Управління персоналом та зміни

---

## 🐛 Troubleshooting

### Frontend не запускається
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend не підключається
1. Перевірити чи запущений MySQL
2. Перевірити .env файл
3. Перевірити CORS налаштування

### Детальна інформація
Див. [`docs/SETUP_INSTRUCTIONS.md`](docs/SETUP_INSTRUCTIONS.md) розділ Troubleshooting

---

## 📄 Ліцензія

MIT License - використовуйте вільно для комерційних та некомерційних проектів.

---

## 🤝 Внесок

Якщо знайшли баг або маєте ідею для покращення - створіть Issue або Pull Request!

---

## 📞 Контакти

Створено для **Bar & Kitchen POS System**

---

## ⭐ Подяка

- [shadcn/ui](https://ui.shadcn.com/) за чудові компоненти
- [Tailwind CSS](https://tailwindcss.com/) за потужний CSS framework
- [Lucide](https://lucide.dev/) за красиві іконки

---

**Зроблено з ❤️ для ресторанного бізнесу**