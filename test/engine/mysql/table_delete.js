import { runTableDeleteTests } from '../../library/table_delete.js';
import { engine } from '../../library/mysql.js';

runTableDeleteTests(
  engine,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
