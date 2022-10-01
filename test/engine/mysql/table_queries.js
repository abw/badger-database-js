import { runTableQueriesTests } from '../../library/table_queries.js';
import { database } from '../../library/mysql.js';

runTableQueriesTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`
)
