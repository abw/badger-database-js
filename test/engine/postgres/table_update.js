import { runTableUpdateTests } from '../../library/table_update.js';
import { database } from '../../library/postgres.js';

runTableUpdateTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
