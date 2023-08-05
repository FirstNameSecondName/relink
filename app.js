const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Маршрут для збору часового поясу і реферера
app.post('/capture-info', async (req, res) => {
    const { timeZone, referrer } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const language = req.headers['accept-language'];
    let dateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(2,12);

    // Відправка даних до Firebase
    const response = await fetch('https://storagefortrash-default-rtdb.europe-west1.firebasedatabase.app/relink/' + dateTime + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ip: ip,
            userAgent: userAgent,
            language: language,
            timeZone: timeZone,
            referrer: referrer
        }),
    }).catch(err => {
        res.status(500).send("Error: " + err);
    });

    res.status(200).send('Info captured');
});

// GET маршрут для редіректу
app.get('/relink', (req, res) => {
    if (req.query.url) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.send('URL parameter is missing.');
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));