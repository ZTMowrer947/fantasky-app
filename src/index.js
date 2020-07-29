// Imports
import 'dotenv/config';

import http from 'http';
import bootstrapDatabase from './bootstrapDatabase';

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
  console.log('Testing database connection...');

  bootstrapDatabase()
    .then(async (connection) => {
      // If successful, report that database connection succeeded
      console.log('Database connection test successful.');

      // Close connection
      await connection.close();
    })
    .catch((error) => {
      // Report that database connection failed
      console.error(`Could not connect to database: ${error}`);

      // Exit with failure code
      process.exit(1);
    });
});
