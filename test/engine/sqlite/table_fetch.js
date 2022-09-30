import { runTableFetchTests } from '../../library/table_fetch.js';

runTableFetchTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)

