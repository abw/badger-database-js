import { runTableIdTests } from '../../library/table_id.js';
import { engine } from '../../library/postgres.js';

runTableIdTests(
  engine,
  `CREATE TABLE users (
    user_id SERIAL,
    name    TEXT,
    email   TEXT
  )`
)
