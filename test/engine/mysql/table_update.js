import { runTableUpdateTests } from '../../library/table_update.js';
import { database } from '../../library/mysql.js';

runTableUpdateTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
