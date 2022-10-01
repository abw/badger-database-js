import { runTableRecordsTests } from '../../library/table_records.js';

runTableRecordsTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)

