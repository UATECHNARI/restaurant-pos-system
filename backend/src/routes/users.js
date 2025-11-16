import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser
} from '../controllers/usersController.js';
import auth from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();
const { authMiddleware } = auth;

// Всі routes потребують автентифікації та ролі admin
router.use(authMiddleware);
router.use(roleCheck(['admin']));

// Отримати всіх користувачів
router.get('/', getAllUsers);

// Отримати користувача за ID
router.get('/:id', getUserById);

// Створити нового користувача з роллю (kitchen, bar, cashier)
router.post('/', createUser);

// Оновити користувача
router.put('/:id', updateUser);

// Скинути пароль користувача
router.post('/:id/reset-password', resetUserPassword);

// Видалити користувача
router.delete('/:id', deleteUser);

export default router;


