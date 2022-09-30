import { runTableUpdateTests } from '../../library/table_update.js';
import { engine } from '../../library/mysql.js';

runTableUpdateTests(
  engine,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
