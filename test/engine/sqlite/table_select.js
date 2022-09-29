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
          columns: 'id:readonly name:required email:required'
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
        id INTEGER PRIMARY KEY ASC,
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
    t.is( result.changes, 1 );
  }
)

test.serial(
  'table select',
  async t => {
    const users = await db.table('users');
    const rows  = await users.select({
      email: 'bobby@badgerpower.com'
    });
    t.is( rows.length, 1 );
    t.is( rows[0].name, 'Bobby Badger' );
  }
)

test.serial(
  'table select columns',
  async t => {
    const users = await db.table('users');
    const rows  = await users.select(
      {
        email: 'bobby@badgerpower.com'
      },
      {
        columns: 'id name'
      }
    );
    t.is( rows.length, 1 );
    t.is( rows[0].id, 1 );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[0].email, undefined );
  }
)
