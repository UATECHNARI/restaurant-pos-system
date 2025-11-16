import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Plus, Pencil, Trash2, LogOut, Package, LayoutGrid, Users, RotateCcw, Copy, Check } from 'lucide-react';
import { TableManagement } from './TableManagement';
import { usersAPI, type User as APIUser } from '../services/api';
import type { Product, Table } from '../App';
import { useEffect } from 'react';

interface AdminPanelProps {
  tables: Table[];
  products: Product[];
  onBack: () => void;
  onLogout: () => void;
  onAddTable: (table: Table) => void;
  onUpdateTable: (tableId: string, table: Table) => void;
  onDeleteTable: (tableId: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (productId: string, product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function AdminPanel({ 
  tables,
  products: initialProducts,
  onBack, 
  onLogout,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<APIUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUserData, setNewUserData] = useState<{ user: APIUser; password: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'kitchen' | 'bar' | 'cashier'>('kitchen');

  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'kitchen' as Product['category'],
    icon: 'pizza' as Product['icon'],
    price: 0,
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        icon: product.icon || 'pizza',
        price: product.price,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'kitchen', icon: 'pizza', price: 0 });
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      const updatedProduct = { ...editingProduct, ...formData };
      setProducts(products.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));
      onUpdateProduct(editingProduct.id, updatedProduct);
    } else {
      const newProduct = { id: Date.now().toString(), ...formData };
      setProducts([...products, newProduct]);
      onAddProduct(newProduct);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    onDeleteProduct(id);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'kitchen': return 'Кухня';
      case 'bar': return 'Бар';
      case 'drinks': return 'Напої';
      case 'desserts': return 'Десерти';
      default: return category;
    }
  };

  const getIconEmoji = (icon?: string) => {
    switch (icon) {
      case 'pizza': return '🍕';
      case 'salad': return '🥗';
      case 'cola': return '🥤';
      case 'alcohol': return '🍺';
      case 'coffee': return '☕';
      default: return '📦';
    }
  };

  const getIconLabel = (icon: string) => {
    switch (icon) {
      case 'pizza': return 'Піца 🍕';
      case 'salad': return 'Салат 🥗';
      case 'cola': return 'Кола 🥤';
      case 'alcohol': return 'Алкоголь 🍺';
      case 'coffee': return 'Кава ☕';
      default: return 'Без значка';
    }
  };

  // Завантажити користувачів
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Завантажити користувачів при монтуванні
  useEffect(() => {
    loadUsers();
  }, []);

  // Створити нового користувача
  const handleCreateUser = async () => {
    try {
      const response = await usersAPI.create(selectedRole);
      if (response.success && response.data) {
        // Показати діалог з логіном та паролем
        setNewUserData({
          user: response.data,
          password: response.data.password || ''
        });
        setShowUserDialog(false);
        setShowPasswordDialog(true);
        // Оновити список користувачів
        await loadUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Помилка при створенні користувача');
    }
  };

  // Скинути пароль користувача
  const handleResetPassword = async (userId: number) => {
    if (!confirm('Скинути пароль цього користувача?')) return;
    
    try {
      const response = await usersAPI.resetPassword(userId);
      if (response.success && response.data) {
        setNewUserData({
          user: response.data,
          password: response.data.password || ''
        });
        setShowPasswordDialog(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Помилка при скиданні пароля');
    }
  };

  // Видалити користувача
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Видалити цього користувача?')) return;
    
    try {
      await usersAPI.delete(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Помилка при видаленні користувача');
    }
  };

  // Скопіювати пароль в буфер обміну
  const handleCopyPassword = async () => {
    if (newUserData?.password) {
      await navigator.clipboard.writeText(newUserData.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Адміністратор';
      case 'kitchen': return 'Кухня';
      case 'bar': return 'Бар';
      case 'cashier': return 'Касир';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-blue-400';
      case 'kitchen': return 'text-orange-400';
      case 'bar': return 'text-purple-400';
      case 'cashier': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onBack}
              variant="outline" 
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-white text-3xl">Адмін-панель</h1>
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

        <Tabs defaultValue="products">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="products" className="text-white hover:bg-gray-700/50">
              <Package className="w-4 h-4 mr-2" />
              Товари
            </TabsTrigger>
            <TabsTrigger value="tables" className="text-white hover:bg-gray-700/50">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Столи
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white hover:bg-gray-700/50">
              <Users className="w-4 h-4 mr-2" />
              Користувачі
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">Управління товарами</CardTitle>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Додати товар
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 py-3 px-4">Значок</th>
                        <th className="text-left text-gray-400 py-3 px-4">Назва</th>
                        <th className="text-left text-gray-400 py-3 px-4">Категорія</th>
                        <th className="text-left text-gray-400 py-3 px-4">Ціна</th>
                        <th className="text-right text-gray-400 py-3 px-4">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="text-white py-3 px-4 text-2xl">{getIconEmoji(product.icon)}</td>
                          <td className="text-white py-3 px-4">{product.name}</td>
                          <td className="text-gray-300 py-3 px-4">{getCategoryLabel(product.category)}</td>
                          <td className="text-green-400 py-3 px-4">{product.price} ₴</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenDialog(product)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tables">
            <TableManagement
              tables={tables}
              onAddTable={onAddTable}
              onUpdateTable={onUpdateTable}
              onDeleteTable={onDeleteTable}
            />
          </TabsContent>
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">Управління користувачами</CardTitle>
                  <Button
                    onClick={() => setShowUserDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Створити користувача
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Створюйте користувачів з ролями (Кухня, Бар, Касир). Логін та пароль генеруються автоматично.
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center text-gray-400 py-8">Завантаження...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 py-3 px-4">Email</th>
                          <th className="text-left text-gray-400 py-3 px-4">Роль</th>
                          <th className="text-left text-gray-400 py-3 px-4">Створено</th>
                          <th className="text-right text-gray-400 py-3 px-4">Дії</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role !== 'admin').map(user => (
                          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="text-white py-3 px-4">{user.email}</td>
                            <td className={`py-3 px-4 font-medium ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </td>
                            <td className="text-gray-300 py-3 px-4">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('uk-UA') : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleResetPassword(user.id)}
                                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                  title="Скинути пароль"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  title="Видалити"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {users.filter(u => u.role !== 'admin').length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center text-gray-400 py-8">
                              Немає користувачів з ролями (Кухня, Бар, Касир)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редагувати товар' : 'Додати товар'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Назва</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white mt-2"
                placeholder="Назва товару"
              />
            </div>

            <div>
              <Label className="text-gray-300">Категорія</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mt-2"
              >
                <option value="kitchen">Кухня</option>
                <option value="bar">Бар</option>
                <option value="drinks">Напої</option>
                <option value="desserts">Десерти</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Значок</Label>
              <select
                value={formData.icon || 'pizza'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value as Product['icon'] })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mt-2"
              >
                <option value="pizza">🍕 Піца</option>
                <option value="salad">🥗 Салат</option>
                <option value="cola">🥤 Кола</option>
                <option value="alcohol">🍺 Алкоголь</option>
                <option value="coffee">☕ Кава</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Ціна (₴)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white mt-2"
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалог створення користувача */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Створити нового користувача</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Роль</Label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'kitchen' | 'bar' | 'cashier')}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white mt-2"
              >
                <option value="kitchen">🍳 Кухня</option>
                <option value="bar">🍺 Бар</option>
                <option value="cashier">💰 Касир</option>
              </select>
              <p className="text-gray-400 text-xs mt-2">
                Логін та пароль будуть згенеровані автоматично
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserDialog(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-green-600 hover:bg-green-700"
            >
              Створити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалог з логіном та паролем */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>✅ Користувач створено!</DialogTitle>
          </DialogHeader>

          {newUserData && (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm font-medium mb-2">
                  ⚠️ Збережіть ці дані! Пароль показано тільки один раз.
                </p>
              </div>

              <div>
                <Label className="text-gray-300">Логін (Email)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newUserData.user.email}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(newUserData.user.email);
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Пароль</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newUserData.password}
                    readOnly
                    type={copiedPassword ? 'text' : 'password'}
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyPassword}
                    className={`${copiedPassword ? 'bg-green-700 border-green-600' : 'bg-gray-700 border-gray-600'} text-white`}
                  >
                    {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {copiedPassword && (
                  <p className="text-green-400 text-xs mt-1">Пароль скопійовано!</p>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Роль</Label>
                <Input
                  value={getRoleLabel(newUserData.user.role)}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowPasswordDialog(false);
                setNewUserData(null);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Зрозуміло
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}