import test from 'ava';
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js';

let db;

setDebug({
  // queries: true,
  // query: true,
  // engine: true,
})

test.before( 'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      fragments: {
        world: 'World',
      },
      queries: {
        hello: 'Hello <world>!',
        create: `
          CREATE TABLE user (
            id INTEGER PRIMARY KEY ASC,
            name TEXT,
            email TEXT
          )`,
        insert:
          'INSERT INTO user (name, email) VALUES (?, ?)',
        selectAll:
          'SELECT * FROM user',
        selectEmail:
          'SELECT * FROM user WHERE email=?',
        select:
          db => db.select('*').from('user'),
        selectBobby:
          db => db.select('*').from('user').where({ name: 'Bobby Badger' }),
        selectByName:
          db => db.query('select').where('name'),
        selectByEmail:
          db => db.query('select').where('email'),
      }
    });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial( 'hello query',
  t => {
    const hello = db.query('hello');
    t.is(hello, 'Hello <world>!');
  }
)

test.serial( 'build hello query',
  t => {
    const query = db.buildQuery('hello');
    t.is(query.query, 'Hello World!');
    t.is(query.sql(), 'Hello World!');
  }
)

test.serial( 'create',
  async t => {
    const query = db.buildQuery('create');
    const create = await query.run();
    t.is(create.changes, 0);
  }
)

test.serial( 'insert a row',
  async t => {
    const query = db.buildQuery('insert');
    const insert = await query.run(
      ['Bobby Badger', 'bobby@badgerpower.com']
    );
    t.is(insert.changes, 1);
  }
)

test.serial( 'insert a row with whereValues',
  async t => {
    const query = db.buildQuery('insert', { whereValues: ['Brian Badger'] });
    const values = query.allValues(['brian@badgerpower.com']);
    t.deepEqual(values, ['Brian Badger', 'brian@badgerpower.com']);
    const insert = await query.run(['brian@badgerpower.com']);
    t.is(insert.changes, 1);
  }
)

test.serial( 'fetch any row',
  async t => {
    const bobby = await db.buildQuery('selectEmail').any(
      ['bobby@badgerpower.com']
    );
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'fetch one row',
  async t => {
    const brian = await db.buildQuery('selectEmail').one(
      ['brian@badgerpower.com']
    );
    t.is(brian.name, 'Brian Badger');
  }
)

test.serial( 'fetch all rows',
  async t => {
    const badgers = await db.buildQuery('selectAll').all();
    t.is(badgers.length, 2);
    t.is(badgers[0].name, 'Bobby Badger');
    t.is(badgers[1].name, 'Brian Badger');
  }
)

test.serial( 'select query builder',
  async t => {
    const query = db.buildQuery('select');
    t.is( query.sql(), 'SELECT *\nFROM "user"' );
    const badgers = await query.all();
    t.is(badgers.length, 2);
  }
)

test.serial( 'selectBobby query',
  async t => {
    const query = db.buildQuery('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const bobby = await query.any();
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectBobby query values',
  async t => {
    const query = db.query('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const values = query.values();
    t.deepEqual(values, ['Bobby Badger']);
  }
)

test.serial( 'selectBobby query values with more',
  async t => {
    const query = db.query('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const values = query.values(['foo']);
    t.deepEqual(values, ['Bobby Badger', 'foo']);
  }
)

test.serial( 'selectBobby query values with function',
  async t => {
    const query = db.query('selectBobby').having({ y: 99 });
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?\nHAVING "y" = ?' );
    const values = query.values((w, h) => ['foo', ...w, 'bar', ...h]);
    t.deepEqual(values, ['foo', 'Bobby Badger', 'bar', 99]);
  }
)

test.serial( 'selectBobby query allValues',
  async t => {
    const query = db.query('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const values = query.allValues();
    t.deepEqual(values, ['Bobby Badger']);
  }
)

test.serial( 'selectBobby query whereValues',
  async t => {
    const query = db.query('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const values = query.whereValues();
    t.deepEqual(values, ['Bobby Badger']);
  }
)

test.serial( 'selectBobby query havingValues',
  async t => {
    const query = db.query('selectBobby');
    t.is( query.sql(), 'SELECT *\nFROM "user"\nWHERE "name" = ?' );
    const values = query.havingValues();
    t.deepEqual(values, []);
  }
)

test.serial( 'selectBobby one',
  async t => {
    const bobby = await db.one('selectBobby');
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectBobby any',
  async t => {
    const bobby = await db.any('selectBobby');
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectBobby all',
  async t => {
    const rows = await db.all('selectBobby');
    t.is( rows.length, 1 );
    t.is(rows[0].name, 'Bobby Badger');
  }
)

test.serial( 'selectByName one',
  async t => {
    const bobby = await db.one('selectByName', ['Bobby Badger']);
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectByEmail one',
  async t => {
    const bobby = await db.one('selectByEmail', ['bobby@badgerpower.com']);
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectByName any',
  async t => {
    const bobby = await db.any('selectByName', ['Bobby Badger']);
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectByEmail any',
  async t => {
    const bobby = await db.any('selectByEmail', ['bobby@badgerpower.com']);
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.serial( 'selectByName all',
  async t => {
    const rows = await db.all('selectByName', ['Bobby Badger']);
    t.is(rows.length, 1);
    t.is(rows[0].name, 'Bobby Badger');
  }
)

test.serial( 'selectByEmail all',
  async t => {
    const rows = await db.all('selectByEmail', ['bobby@badgerpower.com']);
    t.is(rows.length, 1);
    t.is(rows[0].name, 'Bobby Badger');
  }
)

test.serial( 'extended select query builder',
  async t => {
    const bobby = await db.query('select').where({ name: 'Bobby Badger' }).one();
    t.is(bobby.name, 'Bobby Badger');
  }
)

test.after( 'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)