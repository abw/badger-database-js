import { runTableRowsTests } from '../../library/table_rows.js';

runTableRowsTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)

