// Імпорт бібліотеки Express
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// Створення маршруту GET, який обробляє всі вхідні запити
app.get('*', async (req, res) => {
  // Отримання IP-адреси та інших заголовків з запиту
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const language = req.headers['accept-language'];

  // Відправка даних до Firebase
  const response = await fetch('https://<your-firebase-db-url>.firebaseio.com/' + dateTime + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip: ip, userAgent: userAgent, language: language }),
  });

  // Перенаправлення користувача до запитаного URL
  const requestedUrl = req.originalUrl.slice(1);
  res.redirect(requestedUrl);
});

// Запуск додатку на порті 3000
app.listen(3000, () => console.log('Server is running on port 3000'));
