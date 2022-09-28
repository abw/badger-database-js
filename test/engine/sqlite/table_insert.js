import test from 'ava';
import { database } from '../../../src/Database.js';

test(
  'table insert',
  async t => {
    const db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        }
      }
    });
    await db.run(
      `CREATE TABLE users (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    )
    const users = await db.table('users');
    const result = await users.insert({
      name:  'Bobby Badger',
      email: 'bobby@badgerpower.com'
    });
    t.is( result.id, 1 );
    t.is( result.changes, 1 );
  }
)