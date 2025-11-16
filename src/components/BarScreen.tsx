import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wine, Clock, CheckCircle, LogOut, Printer, Bell } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';
import type { Order } from '../App';

interface BarScreenProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onLogout: () => void;
}

export function BarScreen({ orders, onUpdateStatus, onLogout }: BarScreenProps) {
  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'accepted': return 'Прийнято';
      case 'preparing': return 'Готується';
      case 'ready': return 'Готово';
      case 'served': return 'Подано';
      default: return '';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'accepted': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'served': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextAction = (status: Order['status']) => {
    switch (status) {
      case 'accepted': return { text: 'Почати готувати', nextStatus: 'preparing' as const };
      case 'preparing': return { text: 'Готово', nextStatus: 'ready' as const };
      case 'ready': return { text: 'Подано', nextStatus: 'served' as const };
      default: return null;
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'served');

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/20 rounded-2xl">
              <Wine className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-white text-3xl">Замовлення Бару</h1>
              <p className="text-gray-400">Активних замовлень: {activeOrders.length}</p>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline" 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Вийти
          </Button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-20">
            <Wine className="w-20 h-20 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-xl">Немає активних замовлень</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map(order => {
              const nextAction = getNextAction(order.status);
              const hasKitchenItems = order.items.some(item => item.category === 'kitchen');
              const isKitchenReady = order.status === 'ready' && hasKitchenItems;
              
              return (
                <Card key={order.id} className={`bg-gray-800 border-gray-700 hover:border-blue-500 transition-all ${isKitchenReady ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900 animate-pulse' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <CardTitle className="text-white text-xl">
                          Стіл {order.tableNumber}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">#{order.id.slice(-4)}</p>
                      </div>
                      <div className="flex gap-2">
                        {isKitchenReady && (
                          <Badge className="bg-green-500 animate-bounce">
                            <Bell className="w-3 h-3 mr-1" />
                            Кухня готова!
                          </Badge>
                        )}
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(order.createdAt).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.filter(item => item.category === 'bar').map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                          <span className="text-white">{item.productName}</span>
                          <span className="text-blue-400">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    {order.comment && (
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-gray-400 text-sm mb-1">Коментар:</p>
                        <p className="text-white">{order.comment}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => printReceipt(order)}
                      variant="outline"
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    {nextAction && (
                      <Button
                        onClick={() => onUpdateStatus(order.id, nextAction.nextStatus)}
                        className={`flex-1 h-12 ${
                          nextAction.nextStatus === 'ready' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {nextAction.nextStatus === 'ready' ? (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        ) : (
                          <Wine className="w-5 h-5 mr-2" />
                        )}
                        {nextAction.text}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}