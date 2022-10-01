import { runTableRecordsTests } from '../../library/table_records.js';
import { database } from '../../library/postgres.js';

runTableRecordsTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
