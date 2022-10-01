import { runTableInsertTests } from '../../library/table_insert.js';
import { database } from '../../library/postgres.js';

runTableInsertTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
);
