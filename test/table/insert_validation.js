import test from 'ava';
import { database } from '../../src/Database.js'
import { InsertValidationError } from '../../src/Utils/Error.js';

let db;
let users;

test.serial(
  'database',
  async t => {
    db = await database({
      engine: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        }
      }
    })
    t.is( db.engine.driver, 'sqlite' );
  }
)

test.serial(
  'create',
  async t => {
    const create = await db.run(
      `CREATE TABLE users (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    );
    t.is(create.changes, 0);
  }
)

test.serial(
  'get users tables',
  async t => {
    users = await db.table('users')
    t.is(users.table, 'users');
  }
)

test.serial(
  'attempt to insert a row with readonly column',
  async t => {
    const error = await t.throwsAsync(
      () => users.insert({
        id: 12345,
        name: 'Bobby Badger',
        email: 'bobby@badgerpower.com'
      })
    );
    t.is(error.message, 'Cannot insert "id" readonly column into users table');
    t.is(error instanceof InsertValidationError, true);
  }
)

test.serial(
  'attempt to insert a row with an unknown column',
  async t => {
    const error = await t.throwsAsync(
      () => users.insert({
        name: 'Bobby Badger',
        email: 'bobby@badgerpower.com',
        is_admin: true
      })
    );
    t.is(error.message, 'Cannot insert unknown "is_admin" column into users table');
    t.is(error instanceof InsertValidationError, true);
  }
)

test.serial(
  'attempt to insert a row without a required column',
  async t => {
    const error = await t.throwsAsync(
      () => users.insert({
        name: 'Bobby Badger',
      })
    );
    t.is(error.message, 'Cannot insert into users table without required column "email"');
    t.is(error instanceof InsertValidationError, true);
  }
)

test.serial(
  'insert a row',
  async t => {
    const result = await users.insert({
      name: 'Bobby Badger',
      email: 'bobby@badgerpower.com'
    })
    t.is(result, '???');
  }
)

