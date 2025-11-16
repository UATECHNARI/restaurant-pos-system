import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UtensilsCrossed, User, ChefHat, Wine, AlertCircle, UserPlus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { handleAPIError, authAPI } from '../services/api';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Швидкі логіни для тестування
  const quickLogins = [
    { email: 'admin@pizza.com', label: 'Адміністратор', icon: User, color: 'text-blue-400' },
    { email: 'cashier@pizza.com', label: 'Касир', icon: UtensilsCrossed, color: 'text-cyan-400' },
    { email: 'kitchen@pizza.com', label: 'Кухня', icon: ChefHat, color: 'text-orange-400' },
    { email: 'bar@pizza.com', label: 'Бар', icon: Wine, color: 'text-purple-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
    setError('');
    setIsLoading(true);

    try {
      await login({ email: quickEmail, password: 'password123' });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Валідація
    if (!registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Будь ласка, заповніть всі поля');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Пароль повинен містити мінімум 6 символів');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Паролі не співпадають');
      return;
    }

    setIsRegistering(true);
    try {
      await authAPI.register({
        email: registerEmail,
        password: registerPassword
      });
      
      setRegisterSuccess(true);
      // Очистити форму
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || 'Помилка при реєстрації');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    setRegisterError('');
    setRegisterSuccess(false);
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Pizza POS System</h1>
          <p className="text-gray-400">Система управління рестораном</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <Label className="text-gray-300 mb-2 block">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-12"
              placeholder="admin@pizza.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Пароль</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-12"
              placeholder="password123"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">Швидкий вхід</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickLogins.map((quick) => (
              <button
                key={quick.email}
                type="button"
                onClick={() => handleQuickLogin(quick.email)}
                disabled={isLoading}
                className="p-4 rounded-xl border-2 border-gray-600 bg-gray-700/50 hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <quick.icon className={`w-6 h-6 mx-auto mb-2 ${quick.color}`} />
                <p className="text-sm text-gray-300">{quick.label}</p>
              </button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-400">
            <p className="mb-1">Тестові облікові записи:</p>
            <p className="text-xs">Пароль для всіх: <span className="text-orange-400 font-mono">password123</span></p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRegister(true)}
              className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Реєстрація (для клієнта)
            </Button>
          </div>
        </form>

        {/* Діалог реєстрації */}
        {showRegister && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/95 backdrop-blur-sm w-full max-w-md p-8 rounded-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">Реєстрація</h2>
                <button
                  onClick={handleCloseRegister}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {registerSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 text-sm font-medium mb-2">
                      ✅ Реєстрація успішна!
                    </p>
                    <p className="text-gray-300 text-sm">
                      Тепер ви можете увійти в систему, використовуючи ваш email та пароль.
                    </p>
                  </div>
                  <Button
                    onClick={handleCloseRegister}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Закрити
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {registerError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-300 text-sm">{registerError}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-300 mb-2 block">Email</Label>
                    <Input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-12"
                      placeholder="your@email.com"
                      required
                      disabled={isRegistering}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Пароль</Label>
                    <Input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-12"
                      placeholder="Мінімум 6 символів"
                      required
                      disabled={isRegistering}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Підтвердити пароль</Label>
                    <Input
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 h-12"
                      placeholder="Введіть пароль ще раз"
                      required
                      disabled={isRegistering}
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-300 text-xs">
                      ℹ️ Реєстрація доступна тільки для клієнтів (роль: адміністратор). 
                      Користувачі з ролями (Кухня, Бар, Касир) створюються через адмін-панель.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseRegister}
                      className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      disabled={isRegistering}
                    >
                      Скасувати
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={isRegistering}
                    >
                      {isRegistering ? 'Реєстрація...' : 'Зареєструватися'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
