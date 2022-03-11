// Imports
import 'dotenv/config';
import 'reflect-metadata';

// Test prisma client connection
console.log('Connecting to database through Prisma...');

import('./prisma').then(() => {
  console.log("Connection successful. Starting web server...")

  // Asyncronously import app
  return import('./app');
}, (error) => {
  console.error((`Could not connect via Prisma: ${error}`))

  process.exit(1);
})
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
