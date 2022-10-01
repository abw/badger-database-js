import { runTableReloadTests } from '../../library/table_reload.js';
import { database } from '../../library/mysql.js';

runTableReloadTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)

