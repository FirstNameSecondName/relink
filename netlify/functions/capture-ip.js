// netlify/functions/capture-ip.js

exports.handler = async function(event, context) {
  // Get the IP address from the headers
  const ip = event.headers['client-ip'];

  // You'll need to handle storing this IP address in your chosen database
  console.log(ip);

  // Redirect the user
  return {
    statusCode: 302,
    headers: {
      Location: 'https://google.com',
    },
    body: '',
  };
}
