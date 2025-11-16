import { Router } from 'express';
import * as ordersController from '../controllers/ordersController.js';
import auth from '../middleware/auth.js';

const router = Router();
const { authMiddleware, roleCheck } = auth;

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

export default router;
