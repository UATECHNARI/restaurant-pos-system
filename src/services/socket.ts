import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Підключитись до WebSocket
  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });
  }

  // Від'єднатись
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  // Приєднатись до кімнати
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join:room', room);
      console.log(`Joined room: ${room}`);
    }
  }

  // Слухати подію "order:created"
  onOrderCreated(callback: (order: any) => void): void {
    this.socket?.on('order:created', callback);
  }

  // Слухати подію "order:updated"
  onOrderUpdated(callback: (data: { id: number; status: string }) => void): void {
    this.socket?.on('order:updated', callback);
  }

  // Слухати подію "kitchen:ready"
  onKitchenReady(callback: (data: { orderId: number; tableNumber: number }) => void): void {
    this.socket?.on('kitchen:ready', callback);
  }

  // Слухати подію "table:updated"
  onTableUpdated(callback: (table: any) => void): void {
    this.socket?.on('table:updated', callback);
  }

  // Видалити слухача події
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Перевірити чи підключений
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Отримати socket instance (для кастомних евентів)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;




