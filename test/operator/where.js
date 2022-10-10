import test from 'ava';
import { connect } from '../../src/Database.js'

let db;

test.serial(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'create users',
  async t => {
    await db.run(`
      CREATE TABLE users (
        id      INTEGER PRIMARY KEY ASC,
        name    TEXT,
        email   TEXT
      )
    `);
    t.pass();
  }
)

test.serial(
  'insert a user',
  async t => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is( result.changes, 1 );
  }
)

test.serial(
  'insert another user',
  async t => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is( result.changes, 1 );
  }
)

test.serial(
  'where column',
  t => {
    const query = db.from('users').select('id name email').where('name');
    t.is( query.sql(), 'SELECT "users"."id", "users"."name", "users"."email"\nFROM "users"\nWHERE "users"."name"=?' );
  }
)

test.serial(
  'where columns',
  t => {
    const query = db.from('users').select('id email').where('name email');
    t.is( query.sql(), 'SELECT "users"."id", "users"."email"\nFROM "users"\nWHERE "users"."name"=? AND "users"."email"=?' );
  }
)

test.serial(
  'where columns array',
  t => {
    const query = db.from('users').select('id email').where(['name', 'email']);
    t.is( query.sql(), 'SELECT "users"."id", "users"."email"\nFROM "users"\nWHERE "users"."name"=? AND "users"."email"=?' );
  }
)

test.serial(
  'where with table name',
  t => {
    const query = db.from('users').select('id email').where('users.name', 'u.email');
    t.is( query.sql(), 'SELECT "users"."id", "users"."email"\nFROM "users"\nWHERE "users"."name"=? AND "u"."email"=?' );
  }
)

test.serial(
  'where column with value',
  t => {
    const query = db.from('users').select('id email').where({ name: 'Brian Badger' });
    t.is( query.sql(), 'SELECT "users"."id", "users"."email"\nFROM "users"\nWHERE "users"."name"=?' );
    t.is( query.values().length, 1 );
    t.is( query.values()[0], 'Brian Badger' );
  }
)

test.after(
  'disconnect',
  async t => {
    db.disconnect();
    t.pass();
  }
)
