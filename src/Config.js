// CURRENTLY NOT USED
import process from 'node:process'

const defaults = {
  client:   'mysql2',
  host:     'localhost',
  port :    3306,
  pool_min: 2,
  pool_max: 10,
}

const client = process.env.DATABASE_CLIENT || defaults.client;

const connection = process.env.DATABASE_CONNECTION || {
  host:     process.env.DATABASE_HOST || defaults.host,
  port:     process.env.DATABASE_PORT || defaults.port,
  database: process.env.DATABASE_NAME,
  user:     process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  // filename: process.env.DATABASE_FILENAME,
  // flags:    splitList(process.env.DATABASE_FLAGS),
};

const pool = {
  min: process.env.DB_POOL_MIN || defaults.pool_min,
  max: process.env.DB_POOL_MAX || defaults.pool_max,
};

export const Config = { client, connection, pool };

export default Config;
