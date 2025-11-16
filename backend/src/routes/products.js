import { Router } from 'express';
import * as productsController from '../controllers/productsController.js';
import auth from '../middleware/auth.js';

const router = Router();
const { authMiddleware, roleCheck } = auth;

// Всі routes потребують авторизації
router.use(authMiddleware);

// GET /api/products - отримати всі продукти
router.get('/', productsController.getAllProducts);

// GET /api/products/:id - отримати продукт за ID
router.get('/:id', productsController.getProductById);

// POST /api/products - створити новий продукт (тільки для admin)
router.post('/', 
  roleCheck(['admin']), 
  productsController.createProduct
);

// PUT /api/products/:id - оновити продукт (тільки для admin)
router.put('/:id',
  roleCheck(['admin']),
  productsController.updateProduct
);

// DELETE /api/products/:id - видалити продукт (тільки для admin)
router.delete('/:id',
  roleCheck(['admin']),
  productsController.deleteProduct
);

// PATCH /api/products/:id/toggle - перемкнути доступність продукту (admin)
router.patch('/:id/toggle',
  roleCheck(['admin']),
  productsController.toggleProductAvailability
);

export default router;




