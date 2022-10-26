import test from 'ava';
import Update from '../../src/Builder/Update.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'update',
  t => {
    const op = db.build.update('a');
    t.true( op instanceof Update )
    t.is( op.sql(), 'UPDATE "a"' );
  }
)

test( 'tables string',
  t => {
    const op = db.build.update('a, b c');
    t.is( op.sql(), 'UPDATE "a", "b", "c"' );
  }
)

test( 'multiple tables as arguments',
  t => {
    const op = db.build.update('a', 'b', 'c');
    t.is( op.sql(), 'UPDATE "a", "b", "c"' );
  }
)

test( 'table with alias',
  t => {
    const op = db.build.update(['a', 'b']);
    t.is( op.sql(), 'UPDATE "a" AS "b"' );
  }
)

test( 'three element array',
  t => {
    const error = t.throws(
      () => db.build.update(['users', 'email', 'email_address']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 3 items specified for query builder "update" component. Expected [table, alias].' );
  }
)

test( 'from sql in object',
  t => {
    const op = db.build.update({ sql: 'a as alpha' });
    t.is( op.sql(), 'UPDATE a as alpha' );
  }
)

test( 'from tagged sql',
  t => {
    const op = db.build.update(sql`a as alpha`);
    t.is( op.sql(), 'UPDATE a as alpha' );
  }
)

test( 'from multiple items',
  t => {
    const op = db.build.update('a', ['b', 'c'], { sql: 'd as delta'});
    t.is( op.sql(), 'UPDATE "a", "b" AS "c", d as delta' );
  }
)

test( 'from table in object',
  t => {
    const op = db.build.update({ table: 'a' });
    t.is( op.sql(), 'UPDATE "a"' );
  }
)

test( 'from tables in object',
  t => {
    const op = db.build.update({ tables: 'a b c' });
    t.is( op.sql(), 'UPDATE "a", "b", "c"' );
  }
)

test( 'from aliased table',
  t => {
    const op = db.build.update({ table: 'a', as: 'b' });
    t.is( op.sql(), 'UPDATE "a" AS "b"' );
  }
)

test( 'update set where',
  t => {
    const op = db.build.update("a").set("b").where("c");
    t.is( op.sql(), 'UPDATE "a"\nSET "b" = ?\nWHERE "c" = ?' );
    t.deepEqual( op.setValues(), [] );
    t.deepEqual( op.whereValues(), [] );
  }
)

test( 'update set where with values',
  t => {
    const op = db.build.update("a").set({ b: 10 }).where({ c: 20 });
    t.is( op.sql(), 'UPDATE "a"\nSET "b" = ?\nWHERE "c" = ?' );
    t.deepEqual( op.setValues(), [10] );
    t.deepEqual( op.whereValues(), [20] );
  }
)

test( 'invalid object',
  t => {
    const error = t.throws(
      () => db.build.update({ users: 'email email_address', oops: 'This is wrong' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "oops, users" properties specified for query builder "update" component.  Valid properties are "tables", "table" and "as".'
    );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Update.generateSQL('a'), 'UPDATE a' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Update.generateSQL(['a', 'b']), 'UPDATE a, b' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
