import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Minus, Trash2, Send, Printer, LogOut, Users } from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';
import type { Product, Order, OrderItem, Table } from '../App';

interface POSScreenProps {
  products: Product[];
  tables: Table[];
  onCreateOrder: (order: Order) => void;
  onLogout: () => void;
}

export function POSScreen({ products, tables, onCreateOrder, onLogout }: POSScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [comment, setComment] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const categories = [
    { value: 'all', label: 'Всі', color: 'bg-gray-700' },
    { value: 'kitchen', label: 'Кухня', color: 'bg-orange-500' },
    { value: 'bar', label: 'Бар', color: 'bg-blue-500' },
    { value: 'drinks', label: 'Напої', color: 'bg-cyan-500' },
    { value: 'desserts', label: 'Десерти', color: 'bg-pink-500' },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        category: product.category === 'kitchen' || product.category === 'bar' ? product.category : 'kitchen',
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    if (!selectedTable) {
      setShowTableDialog(true);
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
      tableNumber: selectedTable,
      items: cart,
      comment,
      status: 'accepted',
      createdAt: new Date(),
      totalPrice: getTotalPrice(),
    };

    onCreateOrder(order);
    printReceipt(order);
    setCart([]);
    setComment('');
    setSelectedTable(null);
  };

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setShowTableDialog(false);
  };

  const handleClear = () => {
    setCart([]);
    setComment('');
  };

  const availableTables = tables.filter(t => t.status === 'available');
  const selectedTableInfo = tables.find(t => t.number === selectedTable);

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl">POS Система</h1>
        <Button 
          onClick={onLogout}
          variant="outline" 
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Вийти
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ліва частина - Товари */}
        <div className="lg:col-span-2 space-y-4">
          {/* Категорії */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`${
                  selectedCategory === cat.value 
                    ? cat.color 
                    : 'bg-gray-800 hover:bg-gray-700'
                } text-white border-0`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Плитки товарів */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-4 transition-all border-2 border-gray-700 hover:border-orange-500 text-left"
              >
                <div className="aspect-square bg-gray-700 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-4xl">🍕</span>
                </div>
                <p className="text-white mb-2 line-clamp-2">{product.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-orange-400 text-lg">{product.price} ₴</p>
                  <Badge 
                    className={`text-xs ${
                      product.category === 'kitchen' ? 'bg-orange-500' :
                      product.category === 'bar' ? 'bg-blue-500' :
                      product.category === 'drinks' ? 'bg-cyan-500' :
                      'bg-pink-500'
                    }`}
                  >
                    {product.category}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Права частина - Кошик */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 h-fit sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl">Кошик</h2>
            {selectedTable && (
              <Badge className="bg-green-600">
                <Users className="w-3 h-3 mr-1" />
                Стіл {selectedTable}
              </Badge>
            )}
          </div>

          {!selectedTable && cart.length > 0 && (
            <Button
              onClick={() => setShowTableDialog(true)}
              variant="outline"
              className="w-full mb-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Users className="w-4 h-4 mr-2" />
              Вибрати стіл
            </Button>
          )}

          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Кошик порожній</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-gray-700 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white flex-1">{item.productName}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 bg-gray-600 hover:bg-gray-500"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 bg-gray-600 hover:bg-gray-500"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-orange-400">{item.price * item.quantity} ₴</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Коментар до замовлення..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mb-4"
            rows={3}
          />

          <div className="border-t border-gray-600 pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Підсумок:</span>
              <span className="text-white text-2xl">{getTotalPrice()} ₴</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleSendOrder}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 h-12"
            >
              <Send className="w-4 h-4 mr-2" />
              Відправити на кухню/бар
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Скасувати
            </Button>
          </div>
        </div>
      </div>

      {/* Діалог вибору столу */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Виберіть стіл</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableTables.map(table => (
              <Button
                key={table.number}
                onClick={() => handleTableSelect(table.number)}
                className={`${
                  selectedTable === table.number
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                } text-white border-0`}
              >
                {table.number}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}