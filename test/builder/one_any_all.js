import test from 'ava';
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js';

let db;

setDebug({ builder: false })

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
  'select one',
  async t => {
    const row = await db.from('users').select('id name email').one();
    t.is( row.id, 1 );
    t.is( row.name, 'Bobby Badger' );
    t.is( row.email, 'bobby@badgerpower.com' );
  }
)

test.serial(
  'select any',
  async t => {
    const row = await db.from('users').select('id name email').any();
    t.is( row.id, 1 );
    t.is( row.name, 'Bobby Badger' );
    t.is( row.email, 'bobby@badgerpower.com' );
  }
)

test.serial(
  'select all',
  async t => {
    const rows = await db.from('users').select('id name email').all();
    t.is( rows.length, 1 );
    t.is( rows[0].id, 1 );
    t.is( rows[0].name, 'Bobby Badger' );
    t.is( rows[0].email, 'bobby@badgerpower.com' );
  }
)

test.serial(
  'add another user',
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
  'select one with value',
  async t => {
    const row = await db.from('users').select('id name email').where('email').one(['brian@badgerpower.com']);
    t.is( row.id, 2 );
    t.is( row.name, 'Brian Badger' );
    t.is( row.email, 'brian@badgerpower.com' );
  }
)

test.serial(
  'select one with where value',
  async t => {
    const row = await db.from('users').select('id name email').where({ email: 'brian@badgerpower.com' }).one();
    t.is( row.id, 2 );
    t.is( row.name, 'Brian Badger' );
    t.is( row.email, 'brian@badgerpower.com' );
  }
)

test.after(
  'disconnect',
  async t => {
    db.disconnect();
    t.pass();
  }
)
