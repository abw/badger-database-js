import { runTableIdTests } from '../../library/table_id.js';
import { database } from '../../library/mysql.js';

runTableIdTests(
  database,
  `CREATE TABLE users (
    user_id SERIAL,
    name    TEXT,
    email   TEXT
  )`
)
