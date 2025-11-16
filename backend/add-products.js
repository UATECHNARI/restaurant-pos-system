import { query as _query } from './src/config/database.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function addProducts() {
  try {
    console.log('📦 Додавання товарів в базу даних...\n');

    // Піца (категорія: kitchen)
    const pizzas = [
      { name: '🍕 Маргарита', price: 150.00, category: 'kitchen', description: 'Класична піца з моцарелою та томатним соусом' },
      { name: '🍕 Пепероні', price: 180.00, category: 'kitchen', description: 'Піца з пепероні та сиром' },
      { name: '🍕 Чотири сири', price: 200.00, category: 'kitchen', description: 'Піца з моцарелою, пармезаном, горгонзолою та фетою' },
      { name: '🍕 Гавайська', price: 170.00, category: 'kitchen', description: 'Піца з куркою, ананасами та сиром' },
      { name: '🍕 М\'ясна', price: 220.00, category: 'kitchen', description: 'Піца з беконом, шинкою, ковбасою та сиром' },
      { name: '🍕 Вегетаріанська', price: 160.00, category: 'kitchen', description: 'Піца з овочами: перець, помідори, гриби, оливки' }
    ];

    // Кава (категорія: bar)
    const coffee = [
      { name: '☕ Еспресо', price: 45.00, category: 'bar', description: 'Класичний італійський еспресо' },
      { name: '☕ Американо', price: 50.00, category: 'bar', description: 'Еспресо з додаванням гарячої води' },
      { name: '☕ Капучино', price: 60.00, category: 'bar', description: 'Еспресо з молоком та молочною піною' },
      { name: '☕ Лате', price: 65.00, category: 'bar', description: 'Еспресо з великою кількістю молока' },
      { name: '☕ Флет Вайт', price: 70.00, category: 'bar', description: 'Еспресо з мікропіною молока' }
    ];

    // Напої (категорія: bar)
    const drinks = [
      { name: '🥤 Кока-Кола', price: 35.00, category: 'bar', description: 'Coca-Cola 0.33л' },
      { name: '🥤 Кока-Кола Зеро', price: 35.00, category: 'bar', description: 'Coca-Cola Zero 0.33л' },
      { name: '🥤 Фанта', price: 35.00, category: 'bar', description: 'Fanta 0.33л' },
      { name: '🥤 Спрайт', price: 35.00, category: 'bar', description: 'Sprite 0.33л' },
      { name: '💧 Вода мінеральна', price: 25.00, category: 'bar', description: 'Мінеральна вода 0.5л' },
      { name: '🍊 Сік апельсиновий', price: 40.00, category: 'bar', description: 'Свіжовичавлений апельсиновий сік' }
    ];

    const allProducts = [...pizzas, ...coffee, ...drinks];

    console.log(`🍕 Піца: ${pizzas.length} позицій`);
    console.log(`☕ Кава: ${coffee.length} позицій`);
    console.log(`🥤 Напої: ${drinks.length} позицій`);
    console.log(`📊 Всього: ${allProducts.length} товарів\n`);

    // Додаємо товари
    for (const product of allProducts) {
      await _query(
        'INSERT INTO products (name, price, category, description, available) VALUES (?, ?, ?, ?, 1)',
        [product.name, product.price, product.category, product.description]
      );
      console.log(`✅ Додано: ${product.name} (${product.category}) - ${product.price} грн`);
    }

    console.log('\n🎉 Всі товари успішно додані!');

    // Показуємо статистику
    const [stats] = await _query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category'
    );
    
    console.log('\n📈 Статистика товарів в БД:');
    stats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} товарів`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка при додаванні товарів:', error.message);
    process.exit(1);
  }
}

addProducts();

