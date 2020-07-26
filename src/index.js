// Imports
import 'dotenv/config';

import http from 'http';

import db from './models';

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
  // Log out message
  console.log('The Fantasky API server is now running on port 5000...');

  // Test database connection
  db.sequelize
    .authenticate()
    .then(() => console.log('Database connection successful.'))
    .catch((error) => {
      // If a database error occurred, log it out
      console.error('Database connection error', error);

      // Exit with failure status
      process.exit(1);
    });
});
