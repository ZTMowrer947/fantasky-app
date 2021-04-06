// Imports
import { createConnection, getConnectionOptions } from 'typeorm';

import Day from '@/entities/Day';
import Task from '@/entities/Task';
import User from '@/entities/User';

// Database connection factory
async function bootstrapDatabase() {
  // Get options for that connection
  const baseOptions = await getConnectionOptions();

  // Extend base configuration
  const options = {
    ...baseOptions,
    entities: [Day, Task, User],
  };

  // Create database connection with selected options
  return createConnection(options);
}

// Exports
export default bootstrapDatabase;
