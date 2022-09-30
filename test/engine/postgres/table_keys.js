import { runTableKeysTests } from '../../library/table_keys.js';
import { engine } from '../../library/postgres.js';

runTableKeysTests(
  engine,
  `CREATE TABLE users (
    key1 TEXT,
    key2 TEXT,
    name TEXT
  )`
)
