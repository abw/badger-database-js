import test from 'ava';
import Select from '../../src/Builder/Select.js';
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

test( 'select',
  t => {
    const op = db.select('a');
    t.true( op instanceof Select )
    t.is( op.sql(), 'SELECT "a"' );
  }
)

test( 'multiple columns',
  t => {
    const op = db.select('a b c');
    t.is( op.sql(), 'SELECT "a", "b", "c"' );
  }
)

test( 'multiple tables with commas',
  t => {
    const op = db.select('a, b,c, d');
    t.is( op.sql(), 'SELECT "a", "b", "c", "d"' );
  }
)

test( 'star',
  t => {
    const op = db.select('*');
    t.is( op.sql(), 'SELECT *' );
  }
)

test( 'table star',
  t => {
    const op = db.select('a.*');
    t.is( op.sql(), 'SELECT "a".*' );
  }
)

test( 'object with columns',
  t => {
    const op = db.select({ columns: 'id email company.*' });
    t.is( op.sql(), 'SELECT "id", "email", "company".*' );
  }
)

test( 'object with column and alias',
  t => {
    const op = db.select({ column: 'email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "email" AS "email_address"' );
  }
)

test( 'object with column, table and alias',
  t => {
    const op = db.select({ table: 'users', column: 'email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"' );
  }
)

test( 'object with table.column and alias',
  t => {
    const op = db.select({ column: 'users.email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"' );
  }
)

test( 'object with columns and table',
  t => {
    const op = db.select({ table: 'users', columns: 'id email' });
    t.is( op.sql(), 'SELECT "users"."id", "users"."email"' );
  }
)

test( 'object with column and table',
  t => {
    const op = db.select({ table: 'users', column: 'id email' });
    t.is( op.sql(), 'SELECT "users"."id", "users"."email"' );
  }
)

test( 'object with columns and prefix',
  t => {
    const op = db.select({ columns: 'id email', prefix: 'user_' });
    t.is( op.sql(), 'SELECT "id" AS "user_id", "email" AS "user_email"' );
  }
)

test( 'object with columns, table and prefix',
  t => {
    const op = db.select({ table: 'users', columns: 'id email', prefix: "user_" });
    t.is( op.sql(), 'SELECT "users"."id" AS "user_id", "users"."email" AS "user_email"' );
  }
)

test( 'two element array',
  t => {
    const op = db.select(['email', 'email_address']);
    t.is( op.sql(), 'SELECT "email" AS "email_address"' );
  }
)

test( 'two element array with table',
  t => {
    const op = db.select(['users.email', 'email_address']);
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"' );
  }
)

test( 'three element array',
  t => {
    const op = db.select(['users', 'email', 'email_address']);
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"' );
  }
)

test( 'four element array',
  t => {
    const error = t.throws(
      () => db.select(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "select" component. Expected [column, alias] or [table, column, alias].' );
  }
)

test( 'columns with table name',
  t => {
    const op = db.select('x.b c');
    t.is( op.sql(), 'SELECT "x"."b", "c"' );
  }
)

test( 'sql in object',
  t => {
    const op = db.select({ sql: 'b as bravo' });
    t.is( op.sql(), 'SELECT b as bravo' );
  }
)

test( 'tagged sql',
  t => {
    const op = db.select(sql`b as bravo`);
    t.is( op.sql(), 'SELECT b as bravo' );
  }
)

test( 'multiple items',
  t => {
    const op = db.select('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "b", "c", "d", "e" AS "f", "x" AS "y"' );
  }
)

test( 'columns with table name and prefix in object',
  t => {
    const op = db
      .select(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      );
    t.is(
      op.sql(),
      'SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"'
    );
  }
)

test( 'invalid object',
  t => {
    const error = t.throws(
      () => db.select({ users: 'email email_address', oops: 'This is wrong' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "oops, users" properties specified for query builder "select" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
    );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Select.generateSQL('a'), 'SELECT a' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Select.generateSQL(['a', 'b']), 'SELECT a, b' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
