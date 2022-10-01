import { runTableKeysTests } from '../../library/table_keys.js';
import { database } from '../../library/postgres.js';

runTableKeysTests(
  database,
  `CREATE TABLE users (
    key1 TEXT,
    key2 TEXT,
    name TEXT
  )`
)
