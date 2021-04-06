// Imports
import 'dotenv/config';
import 'reflect-metadata';

import bootstrapDatabase from './bootstrapDatabase';

// Connect to database
bootstrapDatabase()
  .then(
    () => {
      // If successful, report that database connection succeeded
      console.log('Database connection successful. Starting web server...');

      // Asyncronously import app
      return import('./app');
    },
    (error) => {
      // Report that database connection failed
      console.error(`Could not connect to database: ${error}`);

      // Exit with failure code
      process.exit(1);
    }
  )
  .then(
    ({ default: app }) => {
      // Listen on port 5000
      app.listen(5000, () => {
        console.log('The Fantasky web server is now running on port 5000...');
      });
    },
    (error) => {
      // Report that web server startup failed
      console.error(`Could not start web server: ${error}`);

      // Exit with failure code
      process.exit(1);
    }
  );
