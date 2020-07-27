/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Imports
import { Sequelize } from 'sequelize';

import config from '../config/config';

// Configuration setup
const env = process.env.NODE_ENV ?? 'devlelopment';

const envConfig = config[env];

// Initialize database connection
/**
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  envConfig.database,
  envConfig.username,
  envConfig.password,
  envConfig
);

// Model initialization

// Exports
export { sequelize, Sequelize };
