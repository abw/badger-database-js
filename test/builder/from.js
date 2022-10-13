import test from 'ava';
import From from '../../src/Builder/From.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before(
  'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'from',
  t => {
    const op = db.from('a');
    t.true( op instanceof From )
    t.is( op.sql(), 'FROM "a"' );
  }
)

test(
  'tables string',
  t => {
    const op = db.from('a, b c');
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test(
  'multiple tables as arguments',
  t => {
    const op = db.from('a', 'b', 'c');
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test(
  'table with alias',
  t => {
    const op = db.from(['a', 'b']);
    t.is( op.sql(), 'FROM "a" AS "b"' );
  }
)

test(
  'three element array',
  t => {
    const error = t.throws(
      () => db.from(['users', 'email', 'email_address']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 3 items specified for query builder "from" component. Expected [table, alias].' );
  }
)


test(
  'from sql in object',
  t => {
    const op = db.from({ sql: 'a as alpha' });
    t.is( op.sql(), 'FROM a as alpha' );
  }
)

test(
  'from tagged sql',
  t => {
    const op = db.from(sql`a as alpha`);
    t.is( op.sql(), 'FROM a as alpha' );
  }
)

test(
  'from multiple items',
  t => {
    const op = db.from('a', ['b', 'c'], { sql: 'd as delta'});
    t.is( op.sql(), 'FROM "a", "b" AS "c", d as delta' );
  }
)

test(
  'from table in object',
  t => {
    const op = db.from({ table: 'a' });
    t.is( op.sql(), 'FROM "a"' );
  }
)

test(
  'from tables in object',
  t => {
    const op = db.from({ tables: 'a b c' });
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test(
  'from aliased table',
  t => {
    const op = db.from({ table: 'a', as: 'b' });
    t.is( op.sql(), 'FROM "a" AS "b"' );
  }
)

test(
  'invalid object',
  t => {
    const error = t.throws(
      () => db.from({ users: 'email email_address', oops: 'This is wrong' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "oops, users" properties specified for query builder "from" component.  Valid properties are "tables", "table" and "as".'
    );
  }
)

test(
  'generateSQL() with single value',
  t => {
    t.is( From.generateSQL('a'), 'FROM a' )
  }
)

test(
  'generateSQL() with multiple values',
  t => {
    t.is( From.generateSQL(['a', 'b']), 'FROM a, b' )
  }
)

test.after(
  () => db.disconnect()
)
