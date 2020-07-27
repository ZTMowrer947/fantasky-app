// Imports
import secrets from '../secrets';

// Database configuration
const development = {
  username: process.env.DEV_DB_USER,
  password: process.env.DEV_DB_PASS,
  database: process.env.DEV_DB_NAME,
  host: process.env.DEV_DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: !!secrets.useTls && {
      ca: secrets.ca,
      cert: secrets.cert,
      key: secrets.key,
      dhparams: secrets.dhparams,
    },
  },
};

const test = {
  database: ':memory:',
  dialect: 'sqlite',
};

const production = {
  username: process.env.PROD_DB_NAME,
  password: process.env.PROD_DB_PASS,
  database: process.env.PROD_DB_NAME,
  host: process.env.PROD_DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: !!secrets.useTls && {
      ca: secrets.ca,
      cert: secrets.cert,
      key: secrets.key,
      dhparams: secrets.dhparams,
    },
  },
};

// Exports
export { development, test, production };
