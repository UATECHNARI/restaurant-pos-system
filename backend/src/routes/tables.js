import { Router } from 'express';
import * as tableController from '../controllers/tableController.js';
import auth from '../middleware/auth.js';

const router = Router();
const { authMiddleware, roleCheck } = auth;

// Всі routes потребують авторизації
router.use(authMiddleware);

// GET /api/tables - отримати всі столи
router.get('/', tableController.getAllTables);

// GET /api/tables/:number - отримати стіл за номером
router.get('/:number', tableController.getTableByNumber);

// POST /api/tables - створити новий стіл (тільки для admin)
router.post('/', 
  roleCheck(['admin']), 
  tableController.createTable
);

// PUT /api/tables/:number/status - оновити статус столу (cashier, admin)
router.put('/:number/status',
  roleCheck(['cashier', 'admin']),
  tableController.updateTableStatus
);

// DELETE /api/tables/:number - видалити стіл (тільки для admin)
router.delete('/:number',
  roleCheck(['admin']),
  tableController.deleteTable
);

export default router;




