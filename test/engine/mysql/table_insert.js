import { runTableInsertTests } from '../../library/table_insert.js';
import { engine } from '../../library/mysql.js';

runTableInsertTests(
  engine,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
);
