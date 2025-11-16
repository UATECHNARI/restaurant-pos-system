# 🔊 Голосові сповіщення - Інструкція

## Опис функціоналу

Система автоматично сповіщає бар голосовим повідомленням, коли кухня завершила приготування замовлення.

---

## 🎯 Як це працює

### Сценарій використання:

1. **Касир** створює замовлення для столу #5:
   - 2x Маргарита (піца - кухня)
   - 1x Мохіто (бар)

2. **Кухня** бачить замовлення і натискає кнопки:
   - "Почати готувати" → статус змінюється на "Готується"
   - "Готово" → статус змінюється на "Готово" ✅

3. **Бар** автоматично отримує:
   - 🔊 **Звуковий сигнал** (бідзінь)
   - 🗣️ **Голосове повідомлення:** "Замовлення стіл п'ять готове на кухні"
   - 🟢 **Візуальну індикацію** - зелена анімована рамка та бейдж "Кухня готова!"

4. **Бар** може переглянути замовлення та почати готувати свої напої

---

## 💡 Технічна реалізація

### Web Speech API

Використовується нативний браузерний API для синтезу мови:

```typescript
// utils/voiceNotification.ts

function speakNotification(text: string, lang: string = 'uk-UA'): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;  // Швидкість мови
  utterance.pitch = 1;    // Висота голосу
  utterance.volume = 1;   // Гучність
  
  window.speechSynthesis.speak(utterance);
}
```

### Web Audio API

Для звукового сигналу:

```typescript
function playNotificationSound(): void {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.frequency.value = 800; // Частота в герцах
  oscillator.type = 'sine';
  
  // Плавне згасання
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}
```

---

## 📋 Логіка визначення

### Коли спрацьовує сповіщення:

✅ **Спрацює** якщо:
- Статус замовлення змінюється на `ready`
- В замовленні є позиції категорії `kitchen`
- В замовленні є позиції категорії `bar`

❌ **НЕ спрацює** якщо:
- Замовлення тільки для кухні (без позицій для бару)
- Замовлення тільки для бару (без позицій для кухні)
- Статус не `ready` (наприклад, `preparing` або `served`)

### Код логіки:

```typescript
// App.tsx
const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
  const order = orders.find(o => o.id === orderId);
  
  setOrders(orders.map(order => 
    order.id === orderId ? { ...order, status } : order
  ));
  
  // Перевірка чи потрібно сповістити бар
  if (status === 'ready' && order) {
    const hasKitchenItems = order.items.some(i => i.category === 'kitchen');
    const hasBarItems = order.items.some(i => i.category === 'bar');
    
    if (hasKitchenItems && hasBarItems) {
      notifyWithVoiceAndSound(`Замовлення стіл ${order.tableNumber} готове на кухні`);
    }
  }
}
```

---

## 🎨 Візуальні індикатори

### В BarScreen.tsx:

```typescript
const hasKitchenItems = order.items.some(item => item.category === 'kitchen');
const isKitchenReady = order.status === 'ready' && hasKitchenItems;

// Картка отримує спеціальні класи:
<Card className={`... ${
  isKitchenReady 
    ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900 animate-pulse' 
    : ''
}`}>
  
  {/* Бейдж з іконкою дзвіночка */}
  {isKitchenReady && (
    <Badge className="bg-green-500 animate-bounce">
      <Bell className="w-3 h-3 mr-1" />
      Кухня готова!
    </Badge>
  )}
</Card>
```

**Ефекти:**
- 🟢 Зелена рамка навколо картки (ring-2 ring-green-500)
- 💫 Пульсуюча анімація (animate-pulse)
- 🔔 Анімований бейдж з дзвіночком (animate-bounce)

---

## 🔧 Налаштування

### Зміна голосу:

```typescript
// Змінити мову
utterance.lang = 'en-US'; // Англійська
utterance.lang = 'ru-RU'; // Російська
utterance.lang = 'uk-UA'; // Українська (за замовчуванням)

// Змінити швидкість
utterance.rate = 0.8;  // Повільніше
utterance.rate = 1.0;  // Нормально
utterance.rate = 1.2;  // Швидше

// Змінити висоту голосу
utterance.pitch = 0.8; // Нижче
utterance.pitch = 1.0; // Нормально
utterance.pitch = 1.2; // Вище
```

### Зміна звукового сигналу:

```typescript
// Частота звуку
oscillator.frequency.value = 600;  // Нижче
oscillator.frequency.value = 800;  // Стандарт
oscillator.frequency.value = 1000; // Вище

// Тип хвилі
oscillator.type = 'sine';     // М'який звук
oscillator.type = 'square';   // Різкий звук
oscillator.type = 'sawtooth'; // Пилкоподібний
oscillator.type = 'triangle'; // Трикутник

// Гучність
gainNode.gain.setValueAtTime(0.1, ...); // Тихо
gainNode.gain.setValueAtTime(0.3, ...); // Стандарт
gainNode.gain.setValueAtTime(0.5, ...); // Гучно
```

---

## 🌐 Підтримка браузерів

### Web Speech API:

| Браузер | Підтримка | Примітки |
|---------|-----------|----------|
| Chrome | ✅ Повна | Найкраща підтримка |
| Edge | ✅ Повна | Chromium версія |
| Safari | ✅ Часткова | iOS потребує взаємодії користувача |
| Firefox | ⚠️ Обмежена | Не всі голоси доступні |
| Opera | ✅ Повна | Chromium |

### Web Audio API:

| Браузер | Підтримка |
|---------|-----------|
| Всі сучасні | ✅ Повна |

---

## ⚠️ Обмеження та примітки

### 1. Дозволи браузера

**Chrome/Edge:**
- Не потребує додаткових дозволів
- Працює одразу

**Safari (iOS):**
- Потребує взаємодії користувача перед першим відтворенням
- Додайте кнопку "Увімкнути звук" при першому вході

```typescript
// Приклад активації для Safari
const enableAudio = () => {
  const silence = new AudioContext();
  silence.resume().then(() => {
    console.log('Audio enabled');
  });
};

// Викликати при натисканні кнопки
<button onClick={enableAudio}>Увімкнути звук</button>
```

### 2. Автовідтворення

Деякі браузери блокують автовідтворення звуку до першої взаємодії користувача:

```typescript
// Перевірити чи дозволено
if ('speechSynthesis' in window) {
  console.log('✅ Speech API supported');
} else {
  console.warn('❌ Speech API not supported');
}
```

### 3. Фокус вкладки

Якщо вкладка не в фокусі, деякі браузери можуть:
- Затримати відтворення
- Зменшити гучність
- Повністю заблокувати

**Рішення:** Використовувати Notification API для повідомлень поза фокусом

---

## 🔄 WebSocket інтеграція

При використанні backend з WebSocket:

```typescript
// Frontend - services/websocket.ts
wsService.on('kitchen:ready', (data: { orderId: string; tableNumber: number }) => {
  // Відтворити голосове сповіщення
  notifyWithVoiceAndSound(`Замовлення стіл ${data.tableNumber} готове на кухні`);
  
  // Оновити UI
  setOrders(prev => prev.map(o => 
    o.id === data.orderId ? { ...o, kitchenReady: true } : o
  ));
});
```

```javascript
// Backend - controllers/ordersController.js
if (status === 'ready') {
  const hasKitchen = items.some(item => item.category === 'kitchen');
  const hasBar = items.some(item => item.category === 'bar');
  
  if (hasKitchen && hasBar) {
    // Відправити WebSocket подію
    req.app.io.emit('kitchen:ready', {
      orderId: id,
      tableNumber: orderData[0].table_number
    });
  }
}
```

---

## 🧪 Тестування

### Ручне тестування:

1. Відкрити 3 вкладки браузера:
   - Вкладка 1: Касир (http://localhost:5173)
   - Вкладка 2: Кухня (http://localhost:5173)
   - Вкладка 3: Бар (http://localhost:5173)

2. **Касир:** Створити замовлення з позиціями для кухні та бару
3. **Кухня:** Натиснути "Почати готувати" → "Готово"
4. **Бар:** Перевірити:
   - ✅ Чути звуковий сигнал
   - ✅ Чути голосове повідомлення
   - ✅ Бачити зелену рамку
   - ✅ Бачити бейдж "Кухня готова!"

### Автоматизоване тестування:

```typescript
// Тест функції сповіщення
test('Voice notification plays when kitchen is ready', () => {
  const mockOrder = {
    id: '1',
    tableNumber: 5,
    items: [
      { category: 'kitchen', ... },
      { category: 'bar', ... }
    ]
  };
  
  const speakSpy = jest.spyOn(window.speechSynthesis, 'speak');
  
  handleUpdateOrderStatus('1', 'ready');
  
  expect(speakSpy).toHaveBeenCalled();
  expect(speakSpy.mock.calls[0][0].text).toContain('стіл 5');
});
```

---

## 📝 Кастомізація повідомлень

### Змінити текст:

```typescript
// Різні шаблони повідомлень
const messages = {
  ukr: `Замовлення стіл ${order.tableNumber} готове на кухні`,
  eng: `Order for table ${order.tableNumber} is ready from kitchen`,
  short: `Стіл ${order.tableNumber} готовий`,
  detailed: `Увага! Замовлення для столу номер ${order.tableNumber} було приготовано на кухні і готове до видачі`
};
```

### Додати різні голоси:

```typescript
const utterance = new SpeechSynthesisUtterance(text);

// Отримати доступні голоси
const voices = window.speechSynthesis.getVoices();

// Вибрати український жіночий голос
const ukrainianVoice = voices.find(v => 
  v.lang === 'uk-UA' && v.name.includes('Female')
);

if (ukrainianVoice) {
  utterance.voice = ukrainianVoice;
}
```

---

## 🎛️ Налаштування для Production

### Додати опцію вимкнення звуку:

```typescript
// Додати в localStorage
const [soundEnabled, setSoundEnabled] = useState(
  localStorage.getItem('sound_enabled') !== 'false'
);

const toggleSound = () => {
  const newValue = !soundEnabled;
  setSoundEnabled(newValue);
  localStorage.setItem('sound_enabled', String(newValue));
};

// Використовувати в коді
if (soundEnabled) {
  notifyWithVoiceAndSound(message);
}
```

### Додати кнопку в UI:

```typescript
<Button onClick={toggleSound}>
  {soundEnabled ? (
    <>
      <Volume2 className="w-4 h-4 mr-2" />
      Звук увімкнено
    </>
  ) : (
    <>
      <VolumeX className="w-4 h-4 mr-2" />
      Звук вимкнено
    </>
  )}
</Button>
```

---

## 🔍 Troubleshooting

### Звук не відтворюється:

1. Перевірити підтримку браузером:
```typescript
if (!('speechSynthesis' in window)) {
  alert('Ваш браузер не підтримує голосові сповіщення');
}
```

2. Перевірити дозволи браузера (Chrome DevTools → Application → Permissions)

3. Спробувати іншу вкладку або перезавантажити сторінку

4. Перевірити чи звук не вимкнено в системі

### Голос не той/не української мови:

1. Встановити мовний пакет в ОС
2. Використати `window.speechSynthesis.getVoices()` для перегляду доступних голосів
3. Явно встановити голос через `utterance.voice`

### Затримка відтворення:

- Нормально для перших запитів (завантаження голосового движка)
- Подальші відтворення будуть швидшими

---

## 📊 Статистика використання

Можна додати логування використання:

```typescript
const logNotification = (tableNumber: number) => {
  console.log(`[Voice] Notification sent for table ${tableNumber} at ${new Date().toISOString()}`);
  
  // Відправити в analytics
  analytics.track('voice_notification_played', {
    table: tableNumber,
    timestamp: Date.now()
  });
};
```

---

**Готово! Голосові сповіщення налаштовані та працюють** 🎉
