import { runTableRowsTests } from '../../library/table_rows.js';
import { database } from '../../library/postgres.js';

runTableRowsTests(
  database,
  `CREATE TABLE users (
    id SERIAL,
    name TEXT,
    email TEXT
  )`
)
