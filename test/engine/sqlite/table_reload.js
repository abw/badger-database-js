import { runTableReloadTests } from '../../library/table_reload.js';

runTableReloadTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)

