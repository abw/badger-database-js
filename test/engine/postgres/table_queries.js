import { runTableQueriesTests } from '../../library/table_queries.js';
import { database } from '../../library/postgres.js';

runTableQueriesTests(
  database,
  `CREATE TABLE users (
    id    SERIAL,
    name  TEXT,
    email TEXT
  )`,
  '$1'
)
