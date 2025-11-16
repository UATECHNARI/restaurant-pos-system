import { query as dbQuery } from '../config/database.js';
import { getClientId } from '../middleware/clientMiddleware.js';

// Отримати всі столи (тільки для клієнта користувача)
export async function getAllTables(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { status } = req.query;
    
    let query = 'SELECT * FROM tables WHERE client_id = ?';
    const params = [clientId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY number';
    
    const [tables] = await dbQuery(query, params);
    
    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати стіл за номером (тільки для клієнта користувача)
export async function getTableByNumber(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { number } = req.params;
    
    const [tables] = await dbQuery(
      'SELECT * FROM tables WHERE number = ? AND client_id = ?',
      [number, clientId]
    );
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    res.json({
      success: true,
      data: tables[0]
    });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Створити новий стіл (тільки для клієнта користувача)
export async function createTable(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { number, capacity, status } = req.body;
    
    // Перевірити, чи стіл з таким номером вже існує для цього клієнта
    const [existing] = await dbQuery('SELECT * FROM tables WHERE number = ? AND client_id = ?', [number, clientId]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Table with this number already exists'
      });
    }
    
    const [result] = await dbQuery(
      'INSERT INTO tables (client_id, number, capacity, status) VALUES (?, ?, ?, ?)',
      [clientId, number, capacity || 4, status || 'available']
    );
    
    const [newTable] = await dbQuery(
      'SELECT * FROM tables WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newTable[0],
      message: 'Table created successfully'
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Оновити статус столу (тільки для клієнта користувача)
export async function updateTableStatus(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { number } = req.params;
    const { status } = req.body;
    
    if (!['available', 'occupied', 'reserved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: available, occupied, or reserved'
      });
    }
    
    const [existing] = await dbQuery('SELECT * FROM tables WHERE number = ? AND client_id = ?', [number, clientId]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    await dbQuery(
      'UPDATE tables SET status = ? WHERE number = ? AND client_id = ?',
      [status, number, clientId]
    );
    
    const [updatedTable] = await dbQuery(
      'SELECT * FROM tables WHERE number = ? AND client_id = ?',
      [number, clientId]
    );
    
    // Відправити через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('table:updated', updatedTable[0]);
    }
    
    res.json({
      success: true,
      data: updatedTable[0],
      message: 'Table status updated successfully'
    });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Видалити стіл (тільки для клієнта користувача)
export async function deleteTable(req, res) {
  try {
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(403).json({
        success: false,
        error: 'Користувач не пов\'язаний з клієнтом'
      });
    }

    const { number } = req.params;
    
    const [existing] = await dbQuery('SELECT * FROM tables WHERE number = ? AND client_id = ?', [number, clientId]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      });
    }
    
    // Перевірити, чи немає активних замовлень для цього клієнта
    const [orders] = await dbQuery(
      "SELECT * FROM orders WHERE table_number = ? AND client_id = ? AND status NOT IN ('served', 'cancelled')",
      [number, clientId]
    );
    
    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete table with active orders'
      });
    }
    
    await dbQuery('DELETE FROM tables WHERE number = ? AND client_id = ?', [number, clientId]);
    
    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}



