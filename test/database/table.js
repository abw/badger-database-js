import test from 'ava';
import { connect } from '../../src/Database.js'

let db;
let users;

test.before( 'connect',
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

test.serial( 'create',
  async t => {
    const create = await db.run(
      `CREATE TABLE user (
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

test.serial( 'users table id',
  t => t.is(users.id, 'id')
)

test.serial( 'users table keys',
  t => t.is(users.keys.join(','), 'id')
)

test.after( 'disconnect',
  () => db.disconnect()
)
