import { runTableFetchTests } from '../../library/table_fetch.js';
import { engine } from '../../library/postgres.js';

runTableFetchTests(
  engine,
  `CREATE TABLE users (
    id SERIAL,
    name TEXT,
    email TEXT
  )`
)
