import { runTableIdTests } from '../../library/table_id.js';

runTableIdTests(
  'sqlite:memory',
  `CREATE TABLE users (
    user_id INTEGER PRIMARY KEY ASC,
    name    TEXT,
    email   TEXT
  )`
)
