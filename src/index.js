// Imports
import 'dotenv/config';

import http from 'http';

import app from './app';
import bootstrapDatabase from './bootstrapDatabase';

// HTTP server setup
const server = http.createServer(app);

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
