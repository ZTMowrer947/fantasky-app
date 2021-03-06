// Imports
import { createConnection, getConnection, getConnectionOptions } from 'typeorm';

import Day from '@/entities/Day';
import Task from '@/entities/Task';
import User from '@/entities/User';

// Environment helper
function selectDatabaseEnvironment() {
  // Consider node environment
  switch (process.env.NODE_ENV) {
    // Production
    case 'prod':
    case 'production':
      return 'production';

    // Testing
    case 'test':
    case 'testing':
    case 'staging':
      return 'test';

    // Any other environment falls back to development
    default:
      return 'development';
  }
}

// Database connection retrieval
function getDatabaseConnection() {
  return getConnection(selectDatabaseEnvironment());
}

// Database connection factory
async function bootstrapDatabase() {
  // Select environment to create connection for
  const connectionName = selectDatabaseEnvironment();

  // Get options for that connection
  const baseOptions = await getConnectionOptions(connectionName);

  // Extend base configuration
  const options = {
    ...baseOptions,
    entities: [Day, Task, User],
  };

  // Create database connection with selected options
  const connection = await createConnection(options);

  // Return the newly created connection
  return connection;
}

// Exports
export default bootstrapDatabase;
export { getDatabaseConnection, selectDatabaseEnvironment };
