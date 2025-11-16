# 🎨 Frontend API Service Integration

## Створення API Service для Frontend

### 1. Створити файл `/src/services/api.ts`

```typescript
// src/services/api.ts
import type { Product, Order, Table, UserRole } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Збереження токену
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

// Базовий fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  const data = await response.json();
  return data.data;
}

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    setAuthToken(data.data.token);
    return data.data;
  },

  logout: () => {
    clearAuthToken();
  },
};

// ============================================
// PRODUCTS API
// ============================================
export const productsAPI = {
  getAll: (): Promise<Product[]> => {
    return fetchAPI<Product[]>('/products');
  },

  create: (product: Omit<Product, 'id'>): Promise<Product> => {
    return fetchAPI<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: (id: string, product: Partial<Product>): Promise<Product> => {
    return fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// TABLES API
// ============================================
export const tablesAPI = {
  getAll: (): Promise<Table[]> => {
    return fetchAPI<Table[]>('/tables');
  },

  create: (table: Omit<Table, 'id'>): Promise<Table> => {
    return fetchAPI<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    });
  },

  update: (id: string, table: Partial<Table>): Promise<Table> => {
    return fetchAPI<Table>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    });
  },

  delete: (id: string): Promise<void> => {
    return fetchAPI<void>(`/tables/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  getAll: (filters?: { status?: string; category?: string }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    return fetchAPI<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string): Promise<Order> => {
    return fetchAPI<Order>(`/orders/${id}`);
  },

  create: (order: {
    table_number: number;
    comment?: string;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
  }): Promise<Order> => {
    return fetchAPI<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  updateStatus: (id: string, status: Order['status']): Promise<void> => {
    return fetchAPI<void>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============================================
// STATISTICS API
// ============================================
export const statisticsAPI = {
  getDashboard: (): Promise<{
    active_orders: number;
    kitchen_orders: number;
    bar_orders: number;
    today_revenue: number;
    total_products: number;
    available_tables: number;
    occupied_tables: number;
  }> => {
    return fetchAPI('/statistics/dashboard');
  },

  getRevenue: (period: 'today' | 'week' | 'month' | 'year'): Promise<{
    period: string;
    total_revenue: number;
    orders_count: number;
    average_check: number;
  }> => {
    return fetchAPI(`/statistics/revenue?period=${period}`);
  },
};
```

---

## 2. WebSocket Service (`/src/services/websocket.ts`)

```typescript
// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';
import type { Order } from '../App';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    // Підписатися на події
    this.socket.on('order:created', (order: Order) => {
      this.emit('order:created', order);
    });

    this.socket.on('order:updated', (data: { id: string; status: string }) => {
      this.emit('order:updated', data);
    });

    this.socket.on('table:updated', (table) => {
      this.emit('table:updated', table);
    });
    
    this.socket.on('kitchen:ready', (data: { orderId: string; tableNumber: number }) => {
      this.emit('kitchen:ready', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Підписатися на подію
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Відписатися від події
  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // Викликати всі callback для події
  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export const wsService = new WebSocketService();
```

---

## 3. Оновлення App.tsx

```typescript
// App.tsx
import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { POSScreen } from './components/POSScreen';
import { KitchenScreen } from './components/KitchenScreen';
import { BarScreen } from './components/BarScreen';
import { 
  productsAPI, 
  tablesAPI, 
  ordersAPI, 
  authAPI 
} from './services/api';
import { wsService } from './services/websocket';

// ... types ...

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Завантажити початкові дані
  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  // Підключити WebSocket
  useEffect(() => {
    if (currentUser) {
      wsService.connect();

      // Підписатися на нові замовлення
      wsService.on('order:created', (order: Order) => {
        setOrders(prev => [...prev, order]);
      });

      // Підписатися на оновлення замовлень
      wsService.on('order:updated', ({ id, status }) => {
        setOrders(prev => 
          prev.map(o => o.id === id ? { ...o, status } : o)
        );
      });

      return () => {
        wsService.disconnect();
      };
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [productsData, tablesData, ordersData] = await Promise.all([
        productsAPI.getAll(),
        tablesAPI.getAll(),
        ordersAPI.getAll(),
      ]);

      setProducts(productsData);
      setTables(tablesData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const userData = await authAPI.login(username, password);
      setCurrentUser(userData.role);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setProducts([]);
    setTables([]);
    setOrders([]);
  };

  const handleCreateOrder = async (orderData: any) => {
    try {
      const newOrder = await ordersAPI.create({
        table_number: orderData.tableNumber,
        comment: orderData.comment,
        items: orderData.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      });
      
      // WebSocket автоматично додасть замовлення через подію
      return newOrder;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      // WebSocket автоматично оновить статус
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  // Інші handlers для products і tables...

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white text-xl">Завантаження...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ... решта коду ...
}
```

---

## 4. Оновлення LoginScreen.tsx

```typescript
// components/LoginScreen.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Невірний логін або пароль');
    } finally {
      setLoading(false);
    }
  };

  // ... решта коду ...
}
```

---

## 5. Environment Variables (`.env`)

Створити файл `.env` в корені frontend проекту:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

## 6. Встановити залежності для WebSocket

```bash
npm install socket.io-client
```

---

## 📋 Checklist інтеграції

- [ ] Backend запущено на порту 3001
- [ ] База даних MySQL створена та заповнена
- [ ] Створено файл `src/services/api.ts`
- [ ] Створено файл `src/services/websocket.ts`
- [ ] Оновлено `App.tsx` для використання API
- [ ] Оновлено `LoginScreen.tsx` для реальної авторизації
- [ ] Створено `.env` файл з URL backend
- [ ] Встановлено `socket.io-client`
- [ ] Перевірено що CORS налаштований в backend
- [ ] Перевірено що JWT токени працюють

---

## 🧪 Тестування

```bash
# 1. Запустити backend
cd backend
npm run dev

# 2. Запустити frontend
cd ../
npm run dev

# 3. Відкрити http://localhost:5173
# 4. Ввійти як admin (username: admin, password: password123)
# 5. Перевірити що дані завантажуються з API
```