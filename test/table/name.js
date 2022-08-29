import test from 'ava';
import { createDatabase, databaseConfig } from '../library/database.js';


export const database = createDatabase({
  ...databaseConfig,
  tables: {
    people: {
      columns: 'a b c'
    },
    users: {
      table: 'user',
      columns: 'a b c'
    },
  }
});


test(
  'default name',
  t => t.is( database.table('people').schema.table, 'people')
)

test(
  'custom name',
  t => t.is( database.table('users').schema.table, 'user')
)