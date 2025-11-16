import axios, { AxiosInstance, AxiosError } from 'axios';

// Базовий URL API (можна змінити через змінні середовища)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Створюємо axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд
});

// Interceptor для додавання JWT токену до кожного запиту
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обробки помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Якщо токен невалідний - очистити та перенаправити на логін
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  // role більше не передається - реєстрація тільки для клієнта (admin)
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: 'admin' | 'cashier' | 'kitchen' | 'bar';
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Зберегти токен
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

// ============================================
// PRODUCTS API
// ============================================

export interface Product {
  id: number;
  name: string;
  category: 'kitchen' | 'bar';
  icon?: 'pizza' | 'salad' | 'cola' | 'alcohol' | 'coffee';
  price: number;
  description?: string;
  image_url?: string;
  available: boolean;
}

export const productsAPI = {
  getAll: async (params?: { category?: string; available?: boolean }) => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>('/products', { params });
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  create: async (product: Omit<Product, 'id' | 'available'>) => {
    const response = await apiClient.post<{ success: boolean; data: Product }>('/products', product);
    return response.data.data;
  },

  update: async (id: number, product: Partial<Product>) => {
    const response = await apiClient.put<{ success: boolean; data: Product }>(`/products/${id}`, product);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/products/${id}`);
    return response.data;
  },

  toggleAvailability: async (id: number) => {
    const response = await apiClient.patch<{ success: boolean; data: Product }>(`/products/${id}/toggle`);
    return response.data.data;
  },
};

// ============================================
// TABLES API
// ============================================

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export const tablesAPI = {
  getAll: async (params?: { status?: string }) => {
    const response = await apiClient.get<{ success: boolean; data: Table[] }>('/tables', { params });
    return response.data.data;
  },

  getByNumber: async (number: number) => {
    const response = await apiClient.get<{ success: boolean; data: Table }>(`/tables/${number}`);
    return response.data.data;
  },

  create: async (table: Omit<Table, 'id'>) => {
    const response = await apiClient.post<{ success: boolean; data: Table }>('/tables', table);
    return response.data.data;
  },

  updateStatus: async (number: number, status: Table['status']) => {
    const response = await apiClient.put<{ success: boolean; data: Table }>(`/tables/${number}/status`, { status });
    return response.data.data;
  },

  delete: async (number: number) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/tables/${number}`);
    return response.data;
  },
};

// ============================================
// ORDERS API
// ============================================

export interface OrderItem {
  id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number;
  category?: 'kitchen' | 'bar';
}

export interface Order {
  id: number;
  table_number: number;
  comment?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  total_price: number;
  created_by?: number;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderData {
  table_number: number;
  comment?: string;
  items: Array<{ product_id: number; quantity: number }>;
}

export const ordersAPI = {
  getAll: async (params?: { status?: string; category?: string }) => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>('/orders', { params });
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  create: async (order: CreateOrderData) => {
    const response = await apiClient.post<{ success: boolean; data: Order }>('/orders', order);
    return response.data.data;
  },

  updateStatus: async (id: number, status: Order['status']) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// ============================================
// USERS API (Admin only)
// ============================================

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'cashier' | 'kitchen' | 'bar';
  created_at?: string;
  password?: string; // Тільки при створенні або скиданні пароля
}

export const usersAPI = {
  getAll: async (params?: { role?: string }) => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users', { params });
    return response.data.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  create: async (role: 'kitchen' | 'bar' | 'cashier') => {
    const response = await apiClient.post<{ success: boolean; data: User; message: string }>('/users', { role });
    return response.data;
  },

  update: async (id: number, data: { email?: string }) => {
    const response = await apiClient.put<{ success: boolean; data: User; message: string }>(`/users/${id}`, data);
    return response.data;
  },

  resetPassword: async (id: number) => {
    const response = await apiClient.post<{ success: boolean; data: User; message: string }>(`/users/${id}/reset-password`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};

// ============================================
// STATISTICS API (Admin only)
// ============================================

export const statisticsAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/statistics/dashboard');
    return response.data.data;
  },

  getSales: async (period?: 'today' | 'week' | 'month' | 'year') => {
    const response = await apiClient.get('/statistics/sales', { params: { period } });
    return response.data.data;
  },

  getOrdersTimeline: async (period?: 'day' | 'week' | 'month') => {
    const response = await apiClient.get('/statistics/orders-timeline', { params: { period } });
    return response.data.data;
  },

  getTables: async () => {
    const response = await apiClient.get('/statistics/tables');
    return response.data.data;
  },

  getStaff: async (period?: 'today' | 'week' | 'month') => {
    const response = await apiClient.get('/statistics/staff', { params: { period } });
    return response.data.data;
  },
};

// ============================================
// ERROR HANDLING HELPER
// ============================================

export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message;
  }
  return 'Невідома помилка';
};

export default apiClient;



