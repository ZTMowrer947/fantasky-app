// Imports
import { getConnection } from 'typeorm';

import bootstrapDatabase from './bootstrapDatabase';

// Test setup
beforeAll(async () => {
  // Initialize database connection
  const connection = await bootstrapDatabase();

  // Drop and synchronize entity tables
  await connection.synchronize(false);
});

// Test teardown
afterAll(async () => {
  // Get connection name and instance
  const connection = getConnection();

  // Close connection
  await connection.close();
});
