import { runTableInsertTests } from '../../library/table_insert.js';

runTableInsertTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)
