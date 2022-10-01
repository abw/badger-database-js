import { runTableFetchTests } from '../../library/table_fetch.js';
import { database } from '../../library/mysql.js';

runTableFetchTests(
  database,
  `CREATE TABLE users (
    id SERIAL,
    name TEXT,
    email TEXT
  )`
)

