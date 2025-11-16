import type { Order } from '../App';

export function printReceipt(order: Order) {
  const receiptWindow = window.open('', '_blank', 'width=300,height=600');
  
  if (!receiptWindow) {
    alert('Дозвольте спливаючі вікна для друку чеків');
    return;
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Чек #${order.id.slice(-4)}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          width: 280px;
          margin: 20px auto;
          padding: 0;
          font-size: 14px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
        }
        .info {
          margin-bottom: 15px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .items {
          margin-bottom: 15px;
        }
        .item {
          margin-bottom: 8px;
        }
        .item-name {
          font-weight: bold;
        }
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .total {
          border-top: 2px solid #000;
          padding-top: 10px;
          margin-top: 15px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          border-top: 2px dashed #000;
          padding-top: 15px;
          font-size: 12px;
        }
        @media print {
          body {
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bar & Kitchen POS</h1>
        <p>Ресторан</p>
      </div>
      
      <div class="info">
        <div class="info-row">
          <span>Замовлення:</span>
          <span>#${order.id.slice(-4)}</span>
        </div>
        <div class="info-row">
          <span>Стіл:</span>
          <span>${order.tableNumber}</span>
        </div>
        <div class="info-row">
          <span>Дата:</span>
          <span>${new Date(order.createdAt).toLocaleDateString('uk-UA')}</span>
        </div>
        <div class="info-row">
          <span>Час:</span>
          <span>${new Date(order.createdAt).toLocaleTimeString('uk-UA')}</span>
        </div>
      </div>

      <div class="items">
        ${order.items.map(item => `
          <div class="item">
            <div class="item-name">${item.productName}</div>
            <div class="item-details">
              <span>${item.quantity} × ${item.price} ₴</span>
              <span>${item.price * item.quantity} ₴</span>
            </div>
          </div>
        `).join('')}
      </div>

      ${order.comment ? `
        <div class="info">
          <strong>Коментар:</strong><br>
          ${order.comment}
        </div>
      ` : ''}

      <div class="total">
        <div class="total-row">
          <span>ВСЬОГО:</span>
          <span>${order.totalPrice} ₴</span>
        </div>
      </div>

      <div class="footer">
        <p>Дякуємо за відвідування!</p>
        <p>Bar & Kitchen POS System</p>
      </div>

      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
          🖨️ Друкувати
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">
          ❌ Закрити
        </button>
      </div>

      <script>
        // Автоматично відкрити діалог друку
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
}
