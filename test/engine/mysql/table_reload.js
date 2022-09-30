import { runTableReloadTests } from '../../library/table_reload.js';
import { engine } from '../../library/mysql.js';

runTableReloadTests(
  engine,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)

