import test from 'ava';
import Having from '../../src/Builder/Having.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'having',
  t => {
    const op = db.build.having('a');
    t.true( op instanceof Having )
    t.is( op.sql(), 'HAVING "a" = ?' );
  }
)

test( 'having string',
  t => {
    const query = db.build.having('name');
    t.is( query.sql(), 'HAVING "name" = ?' );
  }
)

test( 'having multiple columns as string',
  t => {
    const query = db.build.having('name email');
    t.is( query.sql(), 'HAVING "name" = ? AND "email" = ?' );
  }
)

test( 'array with two elements',
  t => {
    const query = db.build.having(['name', 'Bobby Badger']);
    t.is( query.sql(), 'HAVING "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with three elements',
  t => {
    const query = db.build.having(['name', '!=', 'Bobby Badger']);
    t.is( query.sql(), 'HAVING "name" != ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with four elements',
  t => {
    const error = t.throws(
      () => db.build.having(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "having" component. Expected [column, value] or [column, operator, value].' );
  }
)

test( 'table name',
  t => {
    const query = db.build.having('users.name', 'u.email');
    t.is( query.sql(), 'HAVING "users"."name" = ? AND "u"."email" = ?' );
  }
)

test( 'column with value',
  t => {
    const query = db.build.having({ name: 'Brian Badger' });
    t.is( query.sql(), 'HAVING "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Brian Badger' );
  }
)

test( 'column with comparison',
  t => {
    const query = db.build.having({ id: ['>', 99] });
    t.is( query.sql(), 'HAVING "id" > ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 99 );
  }
)

test( 'column with comparison operator',
  t => {
    const query = db.build.having({ id: ['>'] });
    t.is( query.sql(), 'HAVING "id" > ?' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'where() and having()',
  t => {
    const query = db.build.having({ b: 20 }).where({ a: 10 });
    t.is( query.sql(), 'WHERE "a" = ?\nHAVING "b" = ?' );
    const values = query.allValues();
    t.is( values.length, 2 );
    t.is( values[0], 10 );
    t.is( values[1], 20 );
  }
)

test( 'where() and having() with interleaved values',
  t => {
    const query = db.build.where({ a: 10 }).where('b').having({ c: 30 }).having('d');
    t.is( query.sql(), 'WHERE "a" = ? AND "b" = ?\nHAVING "c" = ? AND "d" = ?' );
    const values = query.allValues((s, w, h) => [...s, ...w, 20, ...h, 40]);
    t.is( values.length, 4 );
    t.is( values[0], 10 );
    t.is( values[1], 20 );
    t.is( values[2], 30 );
    t.is( values[3], 40 );
  }
)

test( 'object with value array with three elements',
  t => {
    const error = t.throws(
      () => db.build.having({ id: ['id', '>', 123] }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid value array with 3 items specified for query builder "having" component. Expected [value] or [operator, value].' );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Having.generateSQL('a'), 'HAVING a' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Having.generateSQL(['a', 'b']), 'HAVING a AND b' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
