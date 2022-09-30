import { runTableUpdateTests } from '../../library/table_update.js';

runTableUpdateTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)
