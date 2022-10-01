import { runTableQueriesTests } from '../../library/table_queries.js';

runTableQueriesTests(
  'sqlite:memory',
  `CREATE TABLE users (
    id    INTEGER PRIMARY KEY ASC,
    name  TEXT,
    email TEXT
  )`
)
