import test from 'ava';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';

let db;

test.before(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'column',
  t => {
    const query = db.from('users').select('id name email').where('name');
    t.is( query.sql(), 'SELECT "id", "name", "email"\nFROM "users"\nWHERE "name"=?' );
  }
)


test(
  'columns string',
  t => {
    const query = db.from('users').select('id email').where('name email');
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name"=? AND "email"=?' );
  }
)

test(
  'array with two elements',
  t => {
    const query = db.from('users').select('id email').where(['name', 'Bobby Badger']);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name"=?' );
    t.is( query.values().length, 1 );
    t.is( query.values()[0], 'Bobby Badger' );
  }
)

test(
  'array with three elements',
  t => {
    const query = db.from('users').select('id email').where(['name', '!=', 'Bobby Badger']);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name"!=?' );
    t.is( query.values().length, 1 );
    t.is( query.values()[0], 'Bobby Badger' );
  }
)

test(
  'array with four elements',
  t => {
    const error = t.throws(
      () => db.from('a').where(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "where" component. Expected [column, value] or [column, operator, value].' );
  }
)

test(
  'table name',
  t => {
    const query = db.from('users').select('id email').where('users.name', 'u.email');
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "users"."name"=? AND "u"."email"=?' );
  }
)

test(
  'column with value',
  t => {
    const query = db.from('users').select('id email').where({ name: 'Brian Badger' });
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name"=?' );
    t.is( query.values().length, 1 );
    t.is( query.values()[0], 'Brian Badger' );
  }
)

test(
  'column with comparison',
  t => {
    const query = db.from('users').select('email').where({ id: ['>', 99] });
    t.is( query.sql(), 'SELECT "email"\nFROM "users"\nWHERE "id">?' );
    t.is( query.values().length, 1 );
    t.is( query.values()[0], 99 );
  }
)

test(
  'column with comparison operator',
  t => {
    const query = db.from('users').select('email').where({ id: ['>'] });
    t.is( query.sql(), 'SELECT "email"\nFROM "users"\nWHERE "id">?' );
    t.is( query.values().length, 0 );
  }
)

test(
  'object with value array with three elements',
  t => {
    const error = t.throws(
      () => db.from('a').where({ id: ['id', '>', 123] }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid value array with 3 items specified for query builder "where" component. Expected [value] or [operator, value].' );
  }
)


test.after(
  'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)
