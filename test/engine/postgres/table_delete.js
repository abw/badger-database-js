import { runTableDeleteTests } from '../../library/table_delete.js';
import { engine } from '../../library/postgres.js';

runTableDeleteTests(
  engine,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
