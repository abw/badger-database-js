import test from 'ava';
import Columns from '../../src/Builder/Columns.js';
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
  'columns',
  t => {
    const op = db.from('a').columns('b');
    t.true( op instanceof Columns )
    t.is( op.sql(), 'SELECT "a"."b"\nFROM "a"' );
  }
)

test(
  'multiple columns',
  t => {
    const op = db.from('a').columns('b c');
    t.is( op.sql(), 'SELECT "a"."b", "a"."c"\nFROM "a"' );
  }
)

test(
  'multiple columns with commas',
  t => {
    const op = db.from('a').columns('b,c, d');
    t.is( op.sql(), 'SELECT "a"."b", "a"."c", "a"."d"\nFROM "a"' );
  }
)

test(
  'star',
  t => {
    const op = db.from('a').columns('*');
    t.is( op.sql(), 'SELECT "a".*\nFROM "a"' );
  }
)

test(
  'table star',
  t => {
    const op = db.from('a').columns('b.*');
    t.is( op.sql(), 'SELECT "b".*\nFROM "a"' );
  }
)

test(
  'object with columns',
  t => {
    const op = db.from('a').columns({ columns: 'id email company.*' });
    t.is( op.sql(), 'SELECT "a"."id", "a"."email", "company".*\nFROM "a"' );
  }
)

test(
  'object with column and alias',
  t => {
    const op = db.from('a').columns({ column: 'email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "a"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'object with column, table and alias',
  t => {
    const op = db.from('a').columns({ table: 'users', column: 'email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'object with table.column and alias',
  t => {
    const op = db.from('a').columns({ column: 'users.email', as: 'email_address' });
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'object with columns and table',
  t => {
    const op = db.from('a').columns({ table: 'users', columns: 'id email' });
    t.is( op.sql(), 'SELECT "users"."id", "users"."email"\nFROM "a"' );
  }
)

test(
  'object with column and table',
  t => {
    const op = db.from('a').columns({ table: 'users', column: 'id email' });
    t.is( op.sql(), 'SELECT "users"."id", "users"."email"\nFROM "a"' );
  }
)

test(
  'object with columns and prefix',
  t => {
    const op = db.from('a').columns({ columns: 'id email', prefix: 'user_' });
    t.is( op.sql(), 'SELECT "a"."id" AS "user_id", "a"."email" AS "user_email"\nFROM "a"' );
  }
)

test(
  'object with columns, table and prefix',
  t => {
    const op = db.from('a').columns({ table: 'users', columns: 'id email', prefix: "user_" });
    t.is( op.sql(), 'SELECT "users"."id" AS "user_id", "users"."email" AS "user_email"\nFROM "a"' );
  }
)

test(
  'two element array',
  t => {
    const op = db.from('a').columns(['email', 'email_address']);
    t.is( op.sql(), 'SELECT "a"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'two element array with table',
  t => {
    const op = db.from('a').columns(['users.email', 'email_address']);
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'three element array',
  t => {
    const op = db.from('a').columns(['users', 'email', 'email_address']);
    t.is( op.sql(), 'SELECT "users"."email" AS "email_address"\nFROM "a"' );
  }
)

test(
  'four element array',
  t => {
    const error = t.throws(
      () => db.from('a').columns(['users', 'email', 'email_address', 'oops']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is( error.message, 'Invalid array with 4 items specified for query builder "columns" component. Expected [column, alias] or [table, column, alias].' );
  }
)

test(
  'columns with table name',
  t => {
    const op = db.from('a').columns('x.b c');
    t.is( op.sql(), 'SELECT "x"."b", "a"."c"\nFROM "a"' );
  }
)

test(
  'sql in object',
  t => {
    const op = db.from('a').columns({ sql: 'b as bravo' });
    t.is( op.sql(), 'SELECT b as bravo\nFROM "a"' );
  }
)

test(
  'tagged sql',
  t => {
    const op = db.from('a').columns(sql`b as bravo`);
    t.is( op.sql(), 'SELECT b as bravo\nFROM "a"' );
  }
)
test(
  'multiple items',
  t => {
    const op = db.from('a').columns('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "a"."b", "a"."c", "a"."d", "a"."e" AS "f", "a"."x" AS "y"\nFROM "a"' );
  }
)

test(
  'columns with table name and prefix in object',
  t => {
    const op = db
      .from('a')
      .columns(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      );
    t.is(
      op.sql(),
      'SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"\nFROM "a"'
    );
  }
)

test(
  'invalid object',
  t => {
    const error = t.throws(
      () => db.from('a').columns({ users: 'email email_address', oops: 'This is wrong' }).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid object with "oops, users" properties specified for query builder "columns" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
    );
  }
)

test(
  'last table in string',
  t => {
    const op = db.from('a b').columns('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a", "b"' );
  }
)

test(
  'last table in array',
  t => {
    const op = db.from(['a', 'b']).columns('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a" AS "b"' );
  }
)

test(
  'last table in multiple tables',
  t => {
    const op = db.from('a', 'b').columns('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a", "b"' );
  }
)

test(
  'table with alias',
  t => {
    const op = db.from({ table: 'a', as: 'b' }).columns('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a" AS "b"' );
  }
)

test(
  'column with alias from table',
  t => {
    const op = db.from({ table: 'a', as: 'b' }).columns({ column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "b"."x" AS "y"\nFROM "a" AS "b"' );
  }
)

test(
  'interspersing table() methods',
  t => {
    const op = db.from('a d').table('a').columns('b c').table('d').columns('e f');
    t.is( op.sql(), 'SELECT "a"."b", "a"."c", "d"."e", "d"."f"\nFROM "a", "d"' );
  }
)

test(
  'interspersing table() and prefix() methods',
  t => {
    const op = db.from('a d').table('a').prefix('user_').columns('b c').table('d').prefix('company_').columns('e f');
    t.is( op.sql(), 'SELECT "a"."b" AS "user_b", "a"."c" AS "user_c", "d"."e" AS "company_e", "d"."f" AS "company_f"\nFROM "a", "d"' );
  }
)

test(
  'prefix() is ignored when alias is defined',
  t => {
    const op = db.from('a').prefix('user_').columns('b', ['c', 'just_c']);
    t.is( op.sql(), 'SELECT "a"."b" AS "user_b", "a"."c" AS "just_c"\nFROM "a"' );
  }
)

test(
  'prefix() can be blanked',
  t => {
    const op = db.from('a').prefix('user_').columns('b').prefix().columns('c');
    t.is( op.sql(), 'SELECT "a"."b" AS "user_b", "a"."c"\nFROM "a"' );
  }
)

test(
  'generateSQL() with single value',
  t => {
    t.is( Columns.generateSQL('a'), 'SELECT a' )
  }
)

test(
  'generateSQL() with multiple values',
  t => {
    t.is( Columns.generateSQL(['a', 'b']), 'SELECT a, b' )
  }
)

test.after(
  () => db.disconnect()
)
