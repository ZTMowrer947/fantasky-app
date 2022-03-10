// Imports
import 'dotenv/config';
import 'reflect-metadata';

import { PrismaClient } from '@prisma/client';

import bootstrapDatabase from './bootstrapDatabase';

try {
  // Test prisma client connection
  console.log('Connecting to database through Prisma...');

  const prisma = new PrismaClient();

  console.log('Connection successful. Disconnecting...');

  // Disconnect from Prisma
  prisma.$disconnect().then(() => {
    console.log("Disconnection successful. Now connecting through TypeORM (for interim db work)...")

    // Connect through TypeORM
    return bootstrapDatabase();
  }, (error) => {
    console.error((`Could not disconnect: ${error}`))

    process.exit(1);
  })
    .then(
      () => {
        // If successful, report that database connection succeeded
        console.log('TypeORM connection successful. Starting web server...');

        // Asyncronously import app
        return import('./app');
      },
      (error) => {
        // Report that database connection failed
        console.error(`Could not connect via TypeORM: ${error}`);

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
} catch (err) {
  console.error(`Could not connect via Prisma: ${err}`)

  process.exit(1);
}
