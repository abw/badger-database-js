import test from 'ava';
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js';
import { ColumnValidationError } from '../../src/Utils/Error.js';

let db;
let users;

setDebug({
  // table: true
})

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required:fixed'
        }
      }
    })
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'create',
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

test.serial( 'get users tables',
  async t => {
    users = await db.table('users')
    t.is(users.table, 'users');
  }
)

test.serial( 'insert a row',
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

test.serial( 'insert a row with readonly column',
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

test.serial( 'insert a row with an unknown column',
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

test.serial( 'update a row with an unknown column',
  async t => {
    const error = await t.throwsAsync(
      () => users.update(
        {
          name: 'Bobby Badger',
          is_admin: true
        },
        {
          email: 'bobby@badgerpower.com'
        }
      )
    )
    t.is(error.message, 'Unknown "is_admin" column in the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.serial( 'update a row with a fixed column',
  async t => {
    const error = await t.throwsAsync(
      () => users.update(
        {
          email: 'robert@badgerpower.com',
        },
        {
          name: 'Bobby Badger'
        }
      )
    )
    t.is(error.message, 'The "email" column is fixed in the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.serial( 'insert a row without a required column',
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

test.serial( 'fetch rows with an unknown column',
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

test.serial( 'fetch a row with an unknown column in the where clause',
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

test.serial( 'fetch a row with an unknown column in the where clause and pick option',
  async t => {
    const user = await users.fetchOne(
      {
        email:    'bobby@badgerpower.com',
        is_admin: true,
      },
      { pick: true }
    )
    t.is( user.name, 'Bobby Badger' )
  }
)

test.serial( 'insert a row with an unknown column with pick option',
  async t => {
    const user = await users.insert(
      {
        name: 'Tommy Tester',
        email: 'tommy@badgerpower.com',
        is_admin: true
      },
      { reload: true, pick: true }
    );
    t.is(user.name, 'Tommy Tester');
    t.falsy(user.is_admin)
  }
)

test.serial( 'update a row with an unknown column with pick option',
  async t => {
    const user = await users.updateOne(
      {
        name: 'Tommy the Tester',
        is_admin: true
      },
      {
        email: 'tommy@badgerpower.com',
      },
      { reload: true, pick: true }
    );
    t.is(user.name, 'Tommy the Tester');
    t.falsy(user.is_admin)
  }
)

test.serial( 'update a row with an unknown where column with pick option',
  async t => {
    const user = await users.updateOne(
      {
        name: 'Tommy the Tester',
      },
      {
        email: 'tommy@badgerpower.com',
        is_admin: true
      },
      { reload: true, pick: true }
    );
    t.is(user.name, 'Tommy the Tester');
    t.falsy(user.is_admin)
  }
)

test.serial( 'delete a row with an unknown column',
  async t => {
    const error = await t.throwsAsync(
      () => users.delete(
        {
          email: 'bobby@badgerpower.com',
          is_admin: true
        },
      )
    )
    t.is(error.message, 'Unknown "is_admin" column in the users table');
    t.is(error instanceof ColumnValidationError, true);
  }
)

test.serial( 'delete a row with an unknown column and pick option',
  async t => {
    const result = await users.delete(
      {
        email: 'bobby@badgerpower.com',
        is_admin: true
      },
      { pick: true }
    )
    t.is( result.changes, 1 );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)