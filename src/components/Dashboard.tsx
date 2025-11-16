import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Package, ShoppingCart, ChefHat, Wine, DollarSign, LogOut, Settings } from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import type { Order, Product, Table } from '../App';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  tables: Table[];
  onLogout: () => void;
  onNavigateToAdmin: () => void;
  onAddTable: (table: Table) => void;
  onUpdateTable: (tableId: string, table: Table) => void;
  onDeleteTable: (tableId: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (productId: string, product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function Dashboard({ 
  orders, 
  products, 
  tables,
  onLogout, 
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: DashboardProps) {
  const [showAdmin, setShowAdmin] = useState(false);

  const activeOrders = orders.filter(o => o.status !== 'served').length;
  const kitchenOrders = orders.filter(o => 
    o.status !== 'served' && o.items.some(i => i.category === 'kitchen')
  ).length;
  const barOrders = orders.filter(o => 
    o.status !== 'served' && o.items.some(i => i.category === 'bar')
  ).length;
  const todayRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  
  // Форматування числа з роздільником тисяч та двома знаками після коми
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (showAdmin) {
    return (
      <AdminPanel 
        tables={tables}
        products={products}
        onBack={() => setShowAdmin(false)} 
        onLogout={onLogout}
        onAddTable={onAddTable}
        onUpdateTable={onUpdateTable}
        onDeleteTable={onDeleteTable}
        onAddProduct={onAddProduct}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-3xl mb-2">Dashboard</h1>
            <p className="text-gray-400">Панель адміністратора</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAdmin(true)}
              variant="outline" 
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Адмін-панель
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Вийти
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                Товари
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl text-white">{products.length}</p>
              <p className="text-gray-400 mt-2">В меню</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-cyan-400" />
                </div>
                Активні замовлення
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl text-white">{activeOrders}</p>
              <p className="text-gray-400 mt-2">В обробці</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <ChefHat className="w-6 h-6 text-orange-400" />
                </div>
                Замовлення на кухні
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl text-white">{kitchenOrders}</p>
              <p className="text-gray-400 mt-2">Готується</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Wine className="w-6 h-6 text-blue-400" />
                </div>
                Замовлення в барі
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl text-white">{barOrders}</p>
              <p className="text-gray-400 mt-2">В барі</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                Оборот за день
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl text-white">{formatCurrency(todayRevenue)} ₴</p>
              <p className="text-green-300 mt-2">Всього замовлень: {orders.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}