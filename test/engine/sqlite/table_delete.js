import { runTableDeleteTests } from '../../library/table_delete.js';

runTableDeleteTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)
