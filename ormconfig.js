// Imports
const fs = require('fs');
const path = require('path');

// Paths
const projectRootDir = path.resolve(__dirname);
const projectSourceDir = path.resolve(projectRootDir, 'src');
const projectDistDir = path.resolve(projectRootDir, 'dist');

// TLS configuration
const useTls = !!process.env.USE_TLS;

const tlsOptions = useTls && {
  ca: process.env.TLS_CA ? fs.readFileSync(process.env.TLS_CA) : undefined,
  cert: process.env.TLS_CERT
    ? fs.readFileSync(process.env.TLS_CERT)
    : undefined,
  key: process.env.TLS_KEY ? fs.readFileSync(process.env.TLS_KEY) : undefined,
  dhparam: process.env.TLS_DHPARAMS
    ? fs.readFileSync(process.env.TLS_DHPARAMS)
    : undefined,
};

// TypeORM configuration
/**
 * @type {import("typeorm").ConnectionOptions[]}
 */
module.exports = [
  {
    name: 'development',
    type: 'postgres',
    host: process.env.DEV_DB_HOST,
    port: Number.parseInt(process.env.DEV_DB_PORT || '5432', 10),
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    database: process.env.DEV_DB_NAME,
    ssl: tlsOptions,
    migrationsRun: false,
    entities: [
      path.resolve(projectSourceDir, 'entities', '**', '*.js'),
      path.resolve(projectSourceDir, 'entities', '**', '*.ts'),
    ],
    migrations: [
      path.resolve(projectSourceDir, 'migrations', '**', '*.js'),
      path.resolve(projectSourceDir, 'migrations', '**', '*.ts'),
    ],
    cli: {
      entitiesDir: path.join('src', 'entities'),
      migrationsDir: path.join('src', 'migrations'),
    },
  },
  {
    name: 'test',
    type: 'sqlite',
    database: ':memory:',
    logging: false,
  },
  {
    name: 'production',
    type: 'postgres',
    host: process.env.PROD_DB_HOST,
    port: Number.parseInt(process.env.PROD_DB_PORT || '5432', 10),
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASS,
    database: process.env.PROD_DB_NAME,
    ssl: tlsOptions,
    migrationsRun: false,
    entities: [
      path.resolve(projectDistDir, 'entities', '**', '*.js'),
      path.resolve(projectDistDir, 'entities', '**', '*.ts'),
    ],
    migrations: [
      path.resolve(projectDistDir, 'migrations', '**', '*.js'),
      path.resolve(projectDistDir, 'migrations', '**', '*.ts'),
    ],
    cli: {
      entitiesDir: path.join('dist', 'entities'),
      migrationsDir: path.join('dist', 'migrations'),
    },
  },
];
