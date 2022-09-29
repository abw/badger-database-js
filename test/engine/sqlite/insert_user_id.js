import test from 'ava';
import { database } from '../../../src/Database.js';

let db;

test.serial(
  'connect',
  async t => {
    db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'user_id:readonly:id name:required email:required'
        }
      }
    });
    t.pass();
  }
)

test.serial(
  'create table',
  async t => {
    await db.run(
      `CREATE TABLE users (
        user_id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    )
    t.pass();
  }
)

test.serial(
  'table insert',
  async t => {
    const users = await db.table('users');
    const result = await users.insert({
      name:  'Bobby Badger',
      email: 'bobby@badgerpower.com'
    });
    t.is( result.id, 1 );
    t.is( result.user_id, 1 );
    t.is( result.changes, 1 );
  }
)

