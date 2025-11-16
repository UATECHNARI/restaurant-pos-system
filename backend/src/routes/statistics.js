import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';
import auth from '../middleware/auth.js';

const router = Router();
const { authMiddleware, roleCheck } = auth;

// Всі routes потребують авторизації та ролі admin
router.use(authMiddleware);
router.use(roleCheck(['admin']));

// GET /api/statistics/sales - статистика продажів
router.get('/sales', statsController.getSalesStats);

// GET /api/statistics/orders-timeline - хронологія замовлень
router.get('/orders-timeline', statsController.getOrdersTimeline);

// GET /api/statistics/tables - статистика столів
router.get('/tables', statsController.getTablesStats);

// GET /api/statistics/staff - статистика працівників
router.get('/staff', statsController.getStaffStats);

// GET /api/statistics/dashboard - загальна статистика для дашборду
router.get('/dashboard', statsController.getDashboardStats);

export default router;




