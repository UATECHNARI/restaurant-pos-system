import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { POSScreen } from './components/POSScreen';
import { KitchenScreen } from './components/KitchenScreen';
import { BarScreen } from './components/BarScreen';
import { useAuth } from './contexts/AuthContext';
import socketService from './services/socket';
import { productsAPI, tablesAPI, ordersAPI, Product as APIProduct, Table as APITable, Order as APIOrder } from './services/api';
import { notifyWithVoiceAndSound } from './utils/voiceNotification';

// Типи для компонентів (адаптери для старих типів)
export type UserRole = 'admin' | 'cashier' | 'kitchen' | 'bar';

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied';
}

export interface Product {
  id: string;
  name: string;
  category: 'kitchen' | 'bar' | 'drinks' | 'desserts';
  icon?: 'pizza' | 'salad' | 'cola' | 'alcohol' | 'coffee';
  price: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  category: 'kitchen' | 'bar';
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  comment?: string;
  status: 'accepted' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalPrice: number;
}

export default function App() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false); // Змінено на false

  // Завантажити дані з API при вході
  useEffect(() => {
    if (user) {
      loadInitialData();
      setupWebSocket();
    }

    return () => {
      socketService.disconnect();
  };
  }, [user]);

  const loadInitialData = async () => {
    setIsDataLoading(true);
    try {
      // Завантажити всі дані паралельно
      const [productsData, tablesData, ordersData] = await Promise.all([
        productsAPI.getAll(),
        tablesAPI.getAll(),
        ordersAPI.getAll({ status: undefined }), // Всі замовлення
      ]);

      // Конвертувати API дані в формат компонентів
      setProducts(convertProductsFromAPI(productsData));
      setTables(convertTablesFromAPI(tablesData));
      setOrders(convertOrdersFromAPI(ordersData));
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const setupWebSocket = () => {
    socketService.connect();

    // Підписатись на події
    socketService.onOrderCreated((order) => {
      console.log('New order via WebSocket:', order);
      setOrders((prev) => [...prev, convertOrderFromAPI(order)]);
    });

    socketService.onOrderUpdated(({ id, status }) => {
      console.log('Order updated via WebSocket:', id, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === String(id) ? { ...order, status: convertOrderStatus(status) } : order
        )
      );
    });

    socketService.onTableUpdated((table) => {
      console.log('Table updated via WebSocket:', table);
      setTables((prev) =>
        prev.map((t) => (t.id === String(table.id) ? convertTableFromAPI(table) : t))
      );
    });

    socketService.onKitchenReady(({ orderId, tableNumber }) => {
      notifyWithVoiceAndSound(`Замовлення стіл ${tableNumber} готове на кухні`);
    });
  };

  // Конвертери API -> UI
  const convertProductsFromAPI = (apiProducts: APIProduct[]): Product[] => {
    return apiProducts.map((p) => ({
      id: String(p.id),
      name: p.name,
      category: p.category as 'kitchen' | 'bar',
      icon: p.icon,
      price: p.price,
      image: p.image_url,
    }));
  };

  const convertTablesFromAPI = (apiTables: APITable[]): Table[] => {
    return apiTables.map((t) => ({
      id: String(t.id),
      number: t.number,
      seats: t.capacity,
      status: t.status === 'reserved' ? 'occupied' : t.status,
    }));
  };

  const convertOrdersFromAPI = (apiOrders: APIOrder[]): Order[] => {
    return apiOrders.map((o) => convertOrderFromAPI(o));
  };

  const convertOrderFromAPI = (apiOrder: APIOrder): Order => {
    return {
      id: String(apiOrder.id),
      tableNumber: apiOrder.table_number,
      items: apiOrder.items.map((item) => ({
        id: String(item.id),
        productId: String(item.product_id),
        productName: item.product_name || '',
        quantity: item.quantity,
        price: Number(item.price || 0),
        category: (item.category || 'kitchen') as 'kitchen' | 'bar',
      })),
      comment: apiOrder.comment,
      status: convertOrderStatus(apiOrder.status),
      createdAt: new Date(apiOrder.created_at),
      totalPrice: Number(apiOrder.total_price || 0),
    };
  };

  const convertOrderStatus = (apiStatus: string): Order['status'] => {
    const statusMap: Record<string, Order['status']> = {
      pending: 'accepted',
      preparing: 'preparing',
      ready: 'ready',
      served: 'served',
    };
    return statusMap[apiStatus] || 'accepted';
  };

  // Handlers
  const handleLogout = () => {
    socketService.disconnect();
    logout();
  };

  const handleCreateOrder = async (order: Order) => {
    try {
      const newOrder = await ordersAPI.create({
        table_number: order.tableNumber,
        comment: order.comment,
        items: order.items.map((item) => ({
          product_id: Number(item.productId),
          quantity: item.quantity,
        })),
      });

      setOrders([...orders, convertOrderFromAPI(newOrder)]);
      
      // Оновити статус столу локально (WebSocket також оновить)
      setTables(
        tables.map((t) =>
          t.number === order.tableNumber ? { ...t, status: 'occupied' as const } : t
        )
      );
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const apiStatus = convertStatusToAPI(status);
      await ordersAPI.updateStatus(Number(orderId), apiStatus);

      // Оновити локально (WebSocket також оновить)
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)));

      // Якщо served - звільнити стіл
    if (status === 'served') {
        const order = orders.find((o) => o.id === orderId);
      if (order) {
          setTables(
            tables.map((t) =>
              t.number === order.tableNumber ? { ...t, status: 'available' as const } : t
            )
          );
      }
    }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const convertStatusToAPI = (status: Order['status']): APIOrder['status'] => {
    const statusMap: Record<Order['status'], APIOrder['status']> = {
      accepted: 'pending',
      preparing: 'preparing',
      ready: 'ready',
      served: 'served',
    };
    return statusMap[status];
  };

  const handleAddProduct = async (product: Product) => {
    try {
      const newProduct = await productsAPI.create({
        name: product.name,
        category: product.category as 'kitchen' | 'bar',
        icon: product.icon,
        price: product.price,
        description: '',
      });
      setProducts([...products, convertProductFromAPI(newProduct)]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const convertProductFromAPI = (p: APIProduct): Product => ({
    id: String(p.id),
    name: p.name,
    category: p.category as 'kitchen' | 'bar',
    icon: p.icon,
    price: p.price,
    image: p.image_url,
  });

  const handleUpdateProduct = async (productId: string, updatedProduct: Product) => {
    try {
      await productsAPI.update(Number(productId), {
        name: updatedProduct.name,
        category: updatedProduct.category as 'kitchen' | 'bar',
        icon: updatedProduct.icon,
        price: updatedProduct.price,
      });
      setProducts(products.map((p) => (p.id === productId ? updatedProduct : p)));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsAPI.delete(Number(productId));
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddTable = async (table: Table) => {
    try {
      const newTable = await tablesAPI.create({
        number: table.number,
        capacity: table.seats,
        status: table.status === 'occupied' ? 'occupied' : 'available',
      });
      setTables([...tables, convertTableFromAPI(newTable)]);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const convertTableFromAPI = (t: APITable): Table => ({
    id: String(t.id),
    number: t.number,
    seats: t.capacity,
    status: t.status === 'reserved' ? 'occupied' : t.status,
  });

  const handleUpdateTable = async (tableId: string, updatedTable: Table) => {
    try {
      await tablesAPI.updateStatus(updatedTable.number, updatedTable.status as APITable['status']);
      setTables(tables.map((t) => (t.id === tableId ? updatedTable : t)));
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        await tablesAPI.delete(table.number);
        setTables(tables.filter((t) => t.id !== tableId));
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  if (authLoading || (user && isDataLoading)) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Завантаження...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] dark">
      {user.role === 'admin' && (
        <Dashboard 
          orders={orders} 
          products={products}
          tables={tables}
          onLogout={handleLogout}
          onNavigateToAdmin={() => {}}
          onAddTable={handleAddTable}
          onUpdateTable={handleUpdateTable}
          onDeleteTable={handleDeleteTable}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
      {user.role === 'cashier' && (
        <POSScreen 
          products={products}
          tables={tables}
          onCreateOrder={handleCreateOrder}
          onLogout={handleLogout}
        />
      )}
      {user.role === 'kitchen' && (
        <KitchenScreen 
          orders={orders.filter((o) => o.items.some((i) => i.category === 'kitchen'))}
          onUpdateStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
        />
      )}
      {user.role === 'bar' && (
        <BarScreen 
          orders={orders.filter((o) => o.items.some((i) => i.category === 'bar'))}
          onUpdateStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
