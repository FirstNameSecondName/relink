// netlify/functions/capture-ip.js

exports.handler = async function(event, context) {
  // Get the IP address from the headers
  const ip = event.headers['client-ip'];

  // Get the URL to redirect to from the query parameters
  const url = event.queryStringParameters.url;
  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter',
    };
  }

  // TODO: Handle storing the IP address and associated URL in your chosen database
  console.log(`IP: ${ip}, URL: ${url}`);

  // Redirect the user
  return {
    statusCode: 302,
    headers: {
      Location: decodeURIComponent(url),
    },
    body: '',
  };
}
