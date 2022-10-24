// TODO: this is testing the query building starting off a table.
// That still needs some work
import test from 'ava';
import Database from '../../src/Builder/Database.js';
import From from '../../src/Builder/From.js';
import { connect } from '../../src/Database.js'
// import Table from '../../src/builder/Table.js';

let db, users;

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id name email'
        }
      }
    });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'users table',
  async t => {
    users = await db.model.users;
    t.is( users.table, 'users' );
  }
)

test.serial( 'build',
  async t => {
    const builder = users.build;
    t.true( builder instanceof Database )
    t.is( builder.database.engine.engine, 'sqlite' );
  }
)

test.serial( 'build from',
  async t => {
    const from = users.build.from('wibble');
    t.true( from instanceof From )
  }
)

test.serial( 'select',
  async t => {
    const select = users.select('a, b, c');
    const sql = select.sql();
    t.is( sql, 'SELECT "a", "b", "c"\nFROM "users"')
  }
)

test.serial( 'from',
  async t => {
    const from = users.build.from('a, b, c');
    const sql = from.sql();
    t.is( sql, 'FROM "a", "b", "c"')
  }
)

test.serial( 'fetch',
  async t => {
    const fetch = users.select();
    const sql = fetch.sql();
    t.is( sql, 'SELECT "users"."id", "users"."name", "users"."email"\nFROM "users"')
  }
)

test.serial( 'fetch where',
  async t => {
    const select = users.select().where({ a: 10 });
    const sql = select.sql();
    t.is( sql, `SELECT "users"."id", "users"."name", "users"."email"\nFROM "users"\nWHERE "a" = ?`)
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
