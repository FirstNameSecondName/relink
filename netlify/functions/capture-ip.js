// netlify/functions/capture-ip.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Get the IP address from the headers
  const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || event.headers['x-real-ip'];
  const userAgent = event.headers['user-agent'];
  const language = event.headers['accept-language'];
  // Get the URL to redirect to from the query parameters
  const url = event.queryStringParameters.url;
  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter',
    };
  }

  // Generate the current date and time in the format yymmdd-hhmm
  const now = new Date();
  const datetime = now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '-' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');

  // Construct the data to be stored
  const data = { ip };

  // Send a PUT request to your Firebase database
  const firebaseUrl = `https://storagefortrash-default-rtdb.europe-west1.firebasedatabase.app/relink/${datetime}.json`;
  const response = await fetch(firebaseUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: `{"ip":"${ip}", "user-agent":"${user-agent}", "language":"${language}"}`,//JSON.stringify(data),
  });

  // Check for errors
  if (!response.ok) {
    console.error('Failed to store IP address:', response.statusText);
    return {
      statusCode: 500,
      body: 'Failed to store IP address',
    };
  }

  // Redirect the user
  return {
    statusCode: 302,
    headers: {
      Location: decodeURIComponent(url),
    },
    body: '',
  };
}
