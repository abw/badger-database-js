import test from 'ava';
import Returning from '../../src/Builder/Returning.js';
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

test( 'returning',
  t => {
    const op = db.build.returning('a');
    t.true( op instanceof Returning )
    t.is( op.sql(), 'RETURNING "a"' );
  }
)

test( 'multiple columns',
  t => {
    const op = db.build.returning('a b c');
    t.is( op.sql(), 'RETURNING "a", "b", "c"' );
  }
)

test( 'multiple tables with commas',
  t => {
    const op = db.build.returning('a, b,c, d');
    t.is( op.sql(), 'RETURNING "a", "b", "c", "d"' );
  }
)

test( 'star',
  t => {
    const op = db.build.returning('*');
    t.is( op.sql(), 'RETURNING *' );
  }
)

test( 'table star',
  t => {
    const op = db.build.returning('a.*');
    t.is( op.sql(), 'RETURNING "a".*' );
  }
)

test( 'object with columns',
  t => {
    const op = db.build.returning({ columns: 'id email company.*' });
    t.is( op.sql(), 'RETURNING "id", "email", "company".*' );
  }
)

test( 'object with column and alias',
  t => {
    const op = db.build.returning({ column: 'email', as: 'email_address' });
    t.is( op.sql(), 'RETURNING "email" AS "email_address"' );
  }
)

test( 'object with column, table and alias',
  t => {
    const op = db.build.returning({ table: 'users', column: 'email', as: 'email_address' });
    t.is( op.sql(), 'RETURNING "users"."email" AS "email_address"' );
  }
)

test( 'object with table.column and alias',
  t => {
    const op = db.build.returning({ column: 'users.email', as: 'email_address' });
    t.is( op.sql(), 'RETURNING "users"."email" AS "email_address"' );
  }
)

test( 'object with columns and table',
  t => {
    const op = db.build.returning({ table: 'users', columns: 'id email' });
    t.is( op.sql(), 'RETURNING "users"."id", "users"."email"' );
  }
)

test( 'object with column and table',
  t => {
    const op = db.build.returning({ table: 'users', column: 'id email' });
    t.is( op.sql(), 'RETURNING "users"."id", "users"."email"' );
  }
)

test( 'object with columns and prefix',
  t => {
    const op = db.build.returning({ columns: 'id email', prefix: 'user_' });
    t.is( op.sql(), 'RETURNING "id" AS "user_id", "email" AS "user_email"' );
  }
)

test( 'object with columns, table and prefix',
  t => {
    const op = db.build.returning({ table: 'users', columns: 'id email', prefix: "user_" });
    t.is( op.sql(), 'RETURNING "users"."id" AS "user_id", "users"."email" AS "user_email"' );
  }
)

test( 'two element array',
  t => {
    const op = db.build.returning(['email', 'email_address']);
    t.is( op.sql(), 'RETURNING "email" AS "email_address"' );
  }
)

test( 'two element array with table',
  t => {
    const op = db.build.returning(['users.email', 'email_address']);
    t.is( op.sql(), 'RETURNING "users"."email" AS "email_address"' );
  }
)

test( 'three element array',
  t => {
    const op = db.build.returning(['users', 'email', 'email_address']);
    t.is( op.sql(), 'RETURNING "users"."email" AS "email_address"' );
  }
)

test( 'four element array',
  t => {
    const error = t.throws(
      () => db.build.returning(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "returning" component. Expected [column, alias] or [table, column, alias].' );
  }
)

test( 'columns with table name',
  t => {
    const op = db.build.returning('x.b c');
    t.is( op.sql(), 'RETURNING "x"."b", "c"' );
  }
)

test( 'sql in object',
  t => {
    const op = db.build.returning({ sql: 'b as bravo' });
    t.is( op.sql(), 'RETURNING b as bravo' );
  }
)

test( 'tagged sql',
  t => {
    const op = db.build.returning(sql`b as bravo`);
    t.is( op.sql(), 'RETURNING b as bravo' );
  }
)

test( 'multiple items',
  t => {
    const op = db.build.returning('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' });
    t.is( op.sql(), 'RETURNING "b", "c", "d", "e" AS "f", "x" AS "y"' );
  }
)

test( 'columns with table name and prefix in object',
  t => {
    const op = db.build
      .returning(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      );
    t.is(
      op.sql(),
      'RETURNING "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"'
    );
  }
)

test( 'invalid object',
  t => {
    const error = t.throws(
      () => db.build.returning({ users: 'email email_address', oops: 'This is wrong' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "oops, users" properties specified for query builder "returning" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
    );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Returning.generateSQL('a'), 'RETURNING a' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Returning.generateSQL(['a', 'b']), 'RETURNING a, b' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
