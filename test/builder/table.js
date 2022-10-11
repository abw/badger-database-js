import test from 'ava';
import Database from '../../src/Builder/Database.js';
import From from '../../src/Builder/From.js';
import { connect } from '../../src/Database.js'
// import Table from '../../src/builder/Table.js';

let db, users;

test.serial(
  'connect',
  async t => {
    db = await connect({
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

test.serial(
  'users tables',
  async t => {
    users = await db.model.users;
    t.is( users.table, 'users' );
  }
)

test.serial(
  'users table builder',
  async t => {
    const builder = users.builder();
    t.true( builder instanceof Database )
    t.is( builder.database.engine.engine, 'sqlite' );
  }
)

test.serial(
  'users builder from',
  async t => {
    const from = users.builder().from('wibble');
    t.true( from instanceof From )
  }
)

/*
test.serial(
  'users table columns',
  async t => {
    const sql = users.builder().columns('a, b, c').sql();
    t.is( sql, 'SELECT "users"."a", "users"."b", "users"."c"\nFROM "users"')
  }
)
*/

test.serial(
  'users table select',
  async t => {
    const select = users.select('a, b, c');
    const sql = select.sql();
    t.is( sql, 'SELECT "a", "b", "c"\nFROM "users"')
  }
)

/*
test.serial(
  'select columns',
  async t => {
    const select = users.select({ columns: 'a b c' });
    const sql = select.sql();
    t.is( sql, `SELECT "users"."a", "users"."b", "users"."c"\nFROM users`)
  }
)

test.serial(
  'select columns with table name',
  async t => {
    const select = users.select({ columns: 'a b c', table: 'another' });
    const sql = select.sql();
    t.is( sql, `SELECT "another"."a", "another"."b", "another"."c"\nFROM users`)
  }
)

test.serial(
  'select columns from multiple tables',
  async t => {
    const select = users.select({ columns: 'a b' }).from('another').select({ columns: 'x y' });
    const sql = select.sql();
    t.is( sql, `SELECT "users"."a", "users"."b", "another"."x", "another"."y"\nFROM users, another`)
  }
)

test.serial(
  'select columns from multiple tables',
  async t => {
    const select = users.select({ columns: 'a b' }).from('another').select({ columns: 'x y' });
    const sql = select.sql();
    t.is( sql, `SELECT "users"."a", "users"."b", "another"."x", "another"."y"\nFROM users, another`)
  }
)
*/

test.after(
  'disconnect',
  async t => {
    db.disconnect();
    t.pass();
  }
)
