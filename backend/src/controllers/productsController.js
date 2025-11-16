import { query as dbQuery } from '../config/database.js';
import { getClientId } from '../middleware/clientMiddleware.js';

// Отримати всі продукти (тільки для клієнта користувача)
export async function getAllProducts(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { category, available } = req.query;
    
    let query = 'SELECT * FROM products WHERE client_id = ?';
    const params = [clientId];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (available !== undefined) {
      query += ' AND available = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY category, name';
    
    const [products] = await dbQuery(query, params);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати продукт за ID (тільки для клієнта користувача)
export async function getProductById(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { id } = req.params;
    
    const [products] = await dbQuery(
      'SELECT * FROM products WHERE id = ? AND client_id = ?',
      [id, clientId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Створити новий продукт (тільки для клієнта користувача)
export async function createProduct(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      console.error('❌ Create product: client_id is null or undefined');
      console.error('User:', req.user);
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом. Будь ласка, виконайте SQL скрипт add-multi-tenancy.sql та npm run migrate:users, потім перелогіньтесь.'
      });
    }
    
    console.log('✅ Create product: client_id =', clientId);

    const { name, category, price, description, image_url, available, icon } = req.body;
    
    const [result] = await dbQuery(
      'INSERT INTO products (client_id, name, category, icon, price, description, image_url, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId, name, category, icon || null, price, description || null, image_url || null, available !== false ? 1 : 0]
    );
    
    const [newProduct] = await dbQuery(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newProduct[0],
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Оновити продукт (тільки для клієнта користувача)
export async function updateProduct(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { id } = req.params;
    const { name, category, price, description, image_url, available, icon } = req.body;
    
    // Перевірити, чи існує продукт і належить клієнту
    const [existing] = await dbQuery('SELECT * FROM products WHERE id = ? AND client_id = ?', [id, clientId]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    await dbQuery(
      'UPDATE products SET name = ?, category = ?, icon = ?, price = ?, description = ?, image_url = ?, available = ? WHERE id = ? AND client_id = ?',
      [name, category, icon || null, price, description, image_url, available ? 1 : 0, id, clientId]
    );
    
    const [updatedProduct] = await dbQuery(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updatedProduct[0],
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Видалити продукт (тільки для клієнта користувача)
export async function deleteProduct(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { id } = req.params;
    
    const [existing] = await dbQuery('SELECT * FROM products WHERE id = ? AND client_id = ?', [id, clientId]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    await dbQuery('DELETE FROM products WHERE id = ? AND client_id = ?', [id, clientId]);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Перемкнути доступність продукту (тільки для клієнта користувача)
export async function toggleProductAvailability(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { id } = req.params;
    
    const [product] = await dbQuery('SELECT * FROM products WHERE id = ? AND client_id = ?', [id, clientId]);
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const newAvailability = product[0].available ? 0 : 1;
    
    await dbQuery('UPDATE products SET available = ? WHERE id = ? AND client_id = ?', [newAvailability, id, clientId]);
    
    const [updated] = await dbQuery('SELECT * FROM products WHERE id = ? AND client_id = ?', [id, clientId]);
    
    res.json({
      success: true,
      data: updated[0],
      message: `Product ${newAvailability ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}



