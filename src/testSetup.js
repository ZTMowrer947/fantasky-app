// Imports
import { getConnection } from 'typeorm';

import bootstrapDatabase, {
  selectDatabaseEnvironment,
} from './bootstrapDatabase';

// Test setup
beforeAll(async () => {
  // Initialize database connection
  const connection = await bootstrapDatabase();

  // Drop and synchronize entity tables
  await connection.synchronize();
});

// Test teardown
afterAll(async () => {
  // Get connection name and instance
  const name = selectDatabaseEnvironment();
  const connection = getConnection(name);

  // Close connection
  await connection.close();
});
