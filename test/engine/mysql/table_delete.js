import { runTableDeleteTests } from '../../library/table_delete.js';
import { database } from '../../library/mysql.js';

runTableDeleteTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
