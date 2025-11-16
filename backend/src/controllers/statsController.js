import { query as dbQuery } from '../config/database.js';

// Отримати статистику продажів
export async function getSalesStats(req, res) {
  try {
    const { period } = req.query; // today, week, month, year
    
    let dateCondition = '';
    switch (period) {
      case 'today':
        dateCondition = 'DATE(o.created_at) = CURDATE()';
        break;
      case 'week':
        dateCondition = 'YEARWEEK(o.created_at) = YEARWEEK(NOW())';
        break;
      case 'month':
        dateCondition = 'MONTH(o.created_at) = MONTH(NOW()) AND YEAR(o.created_at) = YEAR(NOW())';
        break;
      case 'year':
        dateCondition = 'YEAR(o.created_at) = YEAR(NOW())';
        break;
      default:
        dateCondition = '1=1';
    }
    
    // Загальна статистика
    const [totalStats] = await dbQuery(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        AVG(total_price) as average_order_value
      FROM orders o
      WHERE ${dateCondition} AND status = 'served'
    `);
    
    // Статистика по категоріям
    const [categoryStats] = await dbQuery(`
      SELECT 
        oi.category,
        COUNT(DISTINCT o.id) as orders_count,
        SUM(oi.quantity) as items_sold,
        SUM(oi.price * oi.quantity) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE ${dateCondition} AND o.status = 'served'
      GROUP BY oi.category
    `);
    
    // Топ продукти
    const [topProducts] = await dbQuery(`
      SELECT 
        oi.product_id,
        oi.product_name,
        COUNT(*) as times_ordered,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE ${dateCondition} AND o.status = 'served'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        period: period || 'all',
        total: totalStats[0],
        byCategory: categoryStats,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати статистику замовлень за часом
export async function getOrdersTimeline(req, res) {
  try {
    const { period } = req.query; // day, week, month
    
    let groupBy = '';
    let dateFormat = '';
    
    switch (period) {
      case 'day':
        groupBy = 'DATE(created_at), HOUR(created_at)';
        dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00')";
        break;
      case 'week':
        groupBy = 'DATE(created_at)';
        dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        break;
      case 'month':
        groupBy = 'DATE(created_at)';
        dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        break;
      default:
        groupBy = 'DATE(created_at)';
        dateFormat = "DATE_FORMAT(created_at, '%Y-%m-%d')";
    }
    
    const [timeline] = await dbQuery(`
      SELECT 
        ${dateFormat} as time_period,
        COUNT(*) as orders_count,
        SUM(total_price) as revenue,
        AVG(total_price) as avg_order_value
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY ${groupBy}
      ORDER BY time_period
    `);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get orders timeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати статистику столів
export async function getTablesStats(req, res) {
  try {
    // Загальна статистика столів
    const [tableStats] = await dbQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tables
      GROUP BY status
    `);
    
    // Статистика використання столів
    const [usageStats] = await dbQuery(`
      SELECT 
        t.number,
        t.capacity,
        COUNT(o.id) as total_orders,
        SUM(o.total_price) as total_revenue
      FROM tables t
      LEFT JOIN orders o ON t.number = o.table_number AND o.status = 'served'
      GROUP BY t.number, t.capacity
      ORDER BY total_revenue DESC
    `);
    
    res.json({
      success: true,
      data: {
        status: tableStats,
        usage: usageStats
      }
    });
  } catch (error) {
    console.error('Get tables stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати статистику працівників
export async function getStaffStats(req, res) {
  try {
    const { period } = req.query;
    
    let dateCondition = '';
    switch (period) {
      case 'today':
        dateCondition = 'DATE(o.created_at) = CURDATE()';
        break;
      case 'week':
        dateCondition = 'YEARWEEK(o.created_at) = YEARWEEK(NOW())';
        break;
      case 'month':
        dateCondition = 'MONTH(o.created_at) = MONTH(NOW()) AND YEAR(o.created_at) = YEAR(NOW())';
        break;
      default:
        dateCondition = '1=1';
    }
    
    const [staffStats] = await dbQuery(`
      SELECT 
        u.id,
        u.email,
        u.role,
        COUNT(o.id) as orders_processed,
        SUM(o.total_price) as total_revenue
      FROM users u
      LEFT JOIN orders o ON u.id = o.created_by AND ${dateCondition}
      GROUP BY u.id, u.email, u.role
      ORDER BY orders_processed DESC
    `);
    
    res.json({
      success: true,
      data: staffStats
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Отримати дашборд статистики
export async function getDashboardStats(req, res) {
  try {
    // Сьогоднішні замовлення
    const [todayStats] = await dbQuery(`
      SELECT 
        COUNT(*) as orders_count,
        SUM(total_price) as revenue,
        AVG(total_price) as avg_order
      FROM orders
      WHERE DATE(created_at) = CURDATE() AND status = 'served'
    `);
    
    // Активні замовлення
    const [activeOrders] = await dbQuery(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE status IN ('pending', 'preparing', 'ready')
    `);
    
    // Статус столів
    const [tablesStatus] = await dbQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tables
      GROUP BY status
    `);
    
    // Топ продукт дня
    const [topProduct] = await dbQuery(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as quantity
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE DATE(o.created_at) = CURDATE()
      GROUP BY oi.product_name
      ORDER BY quantity DESC
      LIMIT 1
    `);
    
    res.json({
      success: true,
      data: {
        today: todayStats[0],
        activeOrders: activeOrders[0].count,
        tables: tablesStatus,
        topProduct: topProduct[0] || null
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}




