import express from 'express';
// 💡 ЗМІНЕНО ТУТ: Імпортуємо конкретні функції
import { login, register, getProfile } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const { authMiddleware, roleCheck } = auth; // Припускаємо, що auth.js експортує default об'єкт

// Приклад route для логіну
// 💡 ЗМІНЕНО ТУТ: Використовуємо 'login' напряму
router.post('/login', login);

// Приклад route для реєстрації
// 💡 ЗМІНЕНО ТУТ: Використовуємо 'register' напряму
router.post('/register', register);

// Захищений route (приклад)
// 💡 ЗМІНЕНО ТУТ: Використовуємо 'getProfile' напряму
router.get('/profile', authMiddleware, getProfile);

// Експорт роутера
export default router;