import test from 'ava';
import { connect } from '../../src/Database.js'
import { ColumnValidationError } from '../../src/Utils/Error.js';

let db;
let users;

test.before(
  'database',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        }
      }
    })
    t.is( db.engine.engine, 'sqlite' );
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
    t.is(error.message, 'The "id" column is readonly in the users table');
    t.is(error instanceof ColumnValidationError, true);
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
    t.is(error.message, 'Unknown "is_admin" column in the users table');
    t.is(error instanceof ColumnValidationError, true);
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
    t.is(error.message, 'Missing required column "email" for the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.serial(
  'insert a row',
  async t => {
    const result = await users.insert(
      {
        name: 'Bobby Badger',
        email: 'bobby@badgerpower.com'
      },
      { reload: true }
    )
    t.is(result.id, 1);
    t.is(result.name, 'Bobby Badger');
    t.is(result.email, 'bobby@badgerpower.com');
  }
)

test.serial(
  'attempt to select a row with an unknown column',
  async t => {
    const error = await t.throwsAsync(
      () => users.allRows(
        {
          email: 'bobby@badgerpower.com',
        },
        {
          columns: 'id name is_admin'
        }
      )
    );
    t.is(error.message, 'Unknown "is_admin" column in the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.serial(
  'attempt to select a row with an unknown column in the where clause',
  async t => {
    const error = await t.throwsAsync(
      () => users.oneRow({
        email_address: 'bobby@badgerpower.com',
      })
    );
    t.is(error.message, 'Unknown "email_address" column in the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.after(
  () => db.disconnect()
)