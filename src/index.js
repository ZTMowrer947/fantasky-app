// Imports
const http = require('http');

// HTTP server setup
const server = http.createServer((req, res) => {
  // Define response body
  const body = {
    message: 'The Fantasky API is not yet implemented.',
  };

  // If the headers have not already been sent,
  if (!res.headersSent) {
    // Write header with 503 Service Unavailable
    res.writeHead(503, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    });
  }

  // End response with body
  res.end(body);
});

// Listen on port 5000
server.listen(5000);

// When the server is listening,
server.once('listening', () => {
  console.log('The Fantasky API server is now running on port 5000...');
});
