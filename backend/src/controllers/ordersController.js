import { query as _query, getConnection } from '../config/database.js';
import { getClientId } from '../middleware/clientMiddleware.js';

// Отримати всі замовлення (тільки для клієнта користувача)
export async function getAllOrders(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { status, category } = req.query;
    
    let query = `
      SELECT o.*, u.email as created_by_username
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.client_id = ?
    `;
    
    const conditions = [`o.client_id = ?`];
    const params = [clientId];
    
    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    
    query = `
      SELECT o.*, u.email as created_by_username
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE ` + conditions.join(' AND ') + ` ORDER BY o.created_at DESC`;
    
    const [orders] = await _query(query, params);
    
    // Якщо немає замовлень - повернути порожній масив
    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Отримати items для кожного замовлення
    for (let order of orders) {
      const [items] = await _query(
        'SELECT * FROM order_items WHERE order_id = ? AND client_id = ?',
        [order.id, clientId]
      );
      
      // Фільтрувати items по category якщо потрібно
      order.items = category 
        ? items.filter(item => item.category === category)
        : items;
    }
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати замовлення за ID (тільки для клієнта користувача)
export async function getOrderById(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { id } = req.params;
    
    const [orders] = await _query(
      'SELECT o.*, u.email as created_by_username FROM orders o LEFT JOIN users u ON o.created_by = u.id WHERE o.id = ? AND o.client_id = ?',
      [id, clientId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    const [items] = await _query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    orders[0].items = items;
    
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Створити нове замовлення
export async function createOrder(req, res) {
  const connection = await getConnection();
  
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    await connection.beginTransaction();
    
    const { table_number, comment, items } = req.body;
    const userId = req.user.id;
    
    // Створити замовлення з client_id
    const [orderResult] = await connection.query(
      'INSERT INTO orders (client_id, table_number, comment, created_by, total_price) VALUES (?, ?, ?, ?, 0)',
      [clientId, table_number, comment, userId]
    );
    
    const orderId = orderResult.insertId;
    let totalPrice = 0;
    
    // Додати items
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT name, price, category FROM products WHERE id = ? AND client_id = ?',
        [item.product_id, clientId]
      );
      
      if (product.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      
      await connection.query(
        'INSERT INTO order_items (client_id, order_id, product_id, product_name, quantity, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [clientId, orderId, item.product_id, product[0].name, item.quantity, product[0].price, product[0].category]
      );
      
      totalPrice += product[0].price * item.quantity;
    }
    
    // Оновити загальну суму
    await connection.query(
      'UPDATE orders SET total_price = ? WHERE id = ?',
      [totalPrice, orderId]
    );
    
    // Оновити статус столу (тільки для клієнта)
    await connection.query(
      'UPDATE tables SET status = ? WHERE number = ? AND client_id = ?',
      ['occupied', table_number, clientId]
    );
    
    await connection.commit();
    
    // Отримати створене замовлення
    const [createdOrder] = await connection.query(
      'SELECT * FROM orders WHERE id = ? AND client_id = ?',
      [orderId, clientId]
    );
    
    const [orderItems] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ? AND client_id = ?',
      [orderId, clientId]
    );
    
    createdOrder[0].items = orderItems;
    
    // Відправити через WebSocket (якщо підключено)
    const io = req.app.get('io');
    if (io) {
      io.emit('order:created', createdOrder[0]);
    }
    
    res.status(201).json({
      success: true,
      data: createdOrder[0]
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
}

// Оновити статус замовлення
export async function updateOrderStatus(req, res) {
  const connection = await getConnection();
  
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    await connection.beginTransaction();
    
    const { id } = req.params;
    const { status } = req.body;
    
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ? AND client_id = ?',
      [status, id, clientId]
    );
    
    // Якщо замовлення подано - звільнити стіл
    if (status === 'served') {
      const [order] = await connection.query(
        'SELECT table_number FROM orders WHERE id = ? AND client_id = ?',
        [id, clientId]
      );
      
      if (order.length > 0) {
        await connection.query(
          'UPDATE tables SET status = ? WHERE number = ? AND client_id = ?',
          ['available', order[0].table_number, clientId]
        );
      }
    }
    
    await connection.commit();
    
    // Відправити через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('order:updated', { id, status });
      
      // Якщо кухня готова і є замовлення для бару - сповістити бар
      if (status === 'ready') {
        const [orderData] = await connection.query(
          'SELECT * FROM orders WHERE id = ? AND client_id = ?',
          [id, clientId]
        );
        const [items] = await connection.query(
          'SELECT * FROM order_items WHERE order_id = ? AND client_id = ?',
          [id, clientId]
        );
        
        const hasKitchen = items.some(item => item.category === 'kitchen');
        const hasBar = items.some(item => item.category === 'bar');
        
        if (hasKitchen && hasBar) {
          io.emit('kitchen:ready', {
            orderId: id,
            tableNumber: orderData[0].table_number
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Order status updated'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
}
