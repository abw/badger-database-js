import { runTableReloadTests } from '../../library/table_reload.js';
import { database } from '../../library/postgres.js';

runTableReloadTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)

