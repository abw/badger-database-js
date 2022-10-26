import test from 'ava';
import Where from '../../src/Builder/Where.js';
import { connect } from '../../src/Database.js'
import { sql } from '../../src/index.js';
import { QueryBuilderError } from '../../src/Utils/Error.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'where',
  t => {
    const op = db.build.where('a');
    t.true( op instanceof Where )
    t.is( op.sql(), 'WHERE "a" = ?' );
  }
)

test( 'column',
  t => {
    const query = db.build.from('users').select('id name email').where('name');
    t.is( query.sql(), 'SELECT "id", "name", "email"\nFROM "users"\nWHERE "name" = ?' );
  }
)

test( 'columns string',
  t => {
    const query = db.build.from('users').select('id email').where('name email');
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" = ? AND "email" = ?' );
  }
)

test( 'array with two elements',
  t => {
    const query = db.build.from('users').select('id email').where(['name', 'Bobby Badger']);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with three elements',
  t => {
    const query = db.build.from('users').select('id email').where(['name', '!=', 'Bobby Badger']);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with three elements, last one undefined',
  t => {
    const query = db.build.from('users').select('id email').where(['name', '!=', undefined]);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'array with two elements, second one is a comparison',
  t => {
    const query = db.build.from('users').select('id email').where(['name', ['!=']]);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'array with two elements, second one is an array of comparison and value',
  t => {
    const query = db.build.from('users').select('id email').where(['name', ['!=', 'Bobby Badger']]);
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" != ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with four elements',
  t => {
    const error = t.throws(
      () => db.build.from('a').where(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "where" component. Expected [column, value] or [column, operator, value].' );
  }
)

test( 'table name',
  t => {
    const query = db.build.from('users').select('id email').where('users.name', 'u.email');
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "users"."name" = ? AND "u"."email" = ?' );
  }
)

test( 'column with value',
  t => {
    const query = db.build.from('users').select('id email').where({ name: 'Brian Badger' });
    t.is( query.sql(), 'SELECT "id", "email"\nFROM "users"\nWHERE "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Brian Badger' );
  }
)

test( 'column with comparison',
  t => {
    const query = db.build.from('users').select('email').where({ id: ['>', 99] });
    t.is( query.sql(), 'SELECT "email"\nFROM "users"\nWHERE "id" > ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 99 );
  }
)

test( 'column with comparison operator',
  t => {
    const query = db.build.from('users').select('email').where({ id: ['>'] });
    t.is( query.sql(), 'SELECT "email"\nFROM "users"\nWHERE "id" > ?' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'where sql clause',
  t => {
    const query = db.build.from('users').select('email').where([sql`COUNT(product_id)`, '>', undefined]);
    t.is( query.sql(), 'SELECT "email"\nFROM "users"\nWHERE COUNT(product_id) > ?' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'object with value array with three elements',
  t => {
    const error = t.throws(
      () => db.build.from('a').where({ id: ['id', '>', 123] }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid value array with 3 items specified for query builder "where" component. Expected [value] or [operator, value].' );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Where.generateSQL('a'), 'WHERE a' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Where.generateSQL(['a', 'b']), 'WHERE a AND b' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
