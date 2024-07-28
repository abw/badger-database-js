import { expect, test } from 'vitest'
import Columns from '../../src/Builder/Columns.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectToThrowErrorTypeMessage } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine)
      .toBe('sqlite')
  }
)

test( 'columns',
  () => {
    const op = db.build.from('a').columns('b');
    expect(op)
      .toBeInstanceOf(Columns)
    expect(op.sql())
      .toBe('SELECT "a"."b"\nFROM "a"')
  }
)

test( 'multiple columns',
  () => expect(
    db.build.from('a').columns('b c').sql()
  ).toBe(
    'SELECT "a"."b", "a"."c"\nFROM "a"'
  )
)

test( 'multiple columns with commas',
  () => expect(
    db.build.from('a').columns('b,c, d').sql(),
  ).toBe(
    'SELECT "a"."b", "a"."c", "a"."d"\nFROM "a"'
  )
)

test( 'star',
  () => expect(
    db.build.from('a').columns('*').sql()
  ).toBe(
    'SELECT "a".*\nFROM "a"'
  )
)

test( 'table star',
  () => expect(
    db.build.from('a').columns('b.*').sql()
  ).toBe(
    'SELECT "b".*\nFROM "a"'
  )
)

test( 'object with columns',
  () => expect(
    db.build.from('a').columns({ columns: 'id email company.*' }).sql()
  ).toBe(
    'SELECT "a"."id", "a"."email", "company".*\nFROM "a"'
  )
)

test( 'object with column and alias',
  () => expect(
    db.build.from('a').columns({ column: 'email', as: 'email_address' }).sql()
  ).toBe(
    'SELECT "a"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'object with column, table and alias',
  () => expect(
    db.build.from('a').columns({ table: 'users', column: 'email', as: 'email_address' }).sql()
  ).toBe(
    'SELECT "users"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'object with table.column and alias',
  () => expect(
    db.build.from('a').columns({ column: 'users.email', as: 'email_address' }).sql()
  ).toBe(
    'SELECT "users"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'object with columns and table',
  () => expect(
    db.build.from('a').columns({ table: 'users', columns: 'id email' }).sql()
  ).toBe(
    'SELECT "users"."id", "users"."email"\nFROM "a"'
  )
)

test( 'object with column and table',
  () => expect(
    db.build.from('a').columns({ table: 'users', column: 'id email' }).sql()
  ).toBe(
    'SELECT "users"."id", "users"."email"\nFROM "a"'
  )
)

test( 'object with columns and prefix',
  () => expect(
    db.build.from('a').columns({ columns: 'id email', prefix: 'user_' }).sql()
  ).toBe(
    'SELECT "a"."id" AS "user_id", "a"."email" AS "user_email"\nFROM "a"'
  )
)

test( 'object with columns, table and prefix',
  () => expect(
    db.build.from('a').columns({ table: 'users', columns: 'id email', prefix: "user_" }).sql()
  ).toBe(
    'SELECT "users"."id" AS "user_id", "users"."email" AS "user_email"\nFROM "a"'
  )
)

test( 'two element array',
  () => expect(
    db.build.from('a').columns(['email', 'email_address']).sql()
  ).toBe(
    'SELECT "a"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'two element array with table',
  () => expect(
    db.build.from('a').columns(['users.email', 'email_address']).sql()
  ).toBe(
    'SELECT "users"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'three element array',
  () => expect(
    db.build.from('a').columns(['users', 'email', 'email_address']).sql()
  ).toBe(
    'SELECT "users"."email" AS "email_address"\nFROM "a"'
  )
)

test( 'four element array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from('a').columns(['users', 'email', 'email_address', 'oops']).sql(),
    QueryBuilderError,
    'Invalid array with 4 items specified for query builder "columns" component. Expected [column, alias] or [table, column, alias].'
  )
)

test( 'columns with table name',
  () => expect(
    db.build.from('a').columns('x.b c').sql()
  ).toBe(
    'SELECT "x"."b", "a"."c"\nFROM "a"'
  )
)

test( 'sql in object',
  () => expect(
    db.build.from('a').columns({ sql: 'b as bravo' }).sql()
  ).toBe(
    'SELECT b as bravo\nFROM "a"'
  )
)

test( 'tagged sql',
  () => expect(
    db.build.from('a').columns(sql`b as bravo`).sql()
  ).toBe(
    'SELECT b as bravo\nFROM "a"'
  )
)
test( 'multiple items',
  () => expect(
    db.build.from('a').columns('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' }).sql()
  ).toBe(
    'SELECT "a"."b", "a"."c", "a"."d", "a"."e" AS "f", "a"."x" AS "y"\nFROM "a"'
  )
)

test( 'columns with table name and prefix in object',
  () => expect(
    db.build
      .from('a')
      .columns(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      )
      .sql()
  ).toBe(
    'SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"\nFROM "a"'
  )
)

test( 'invalid object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from('a').columns({ users: 'email email_address', oops: 'This is wrong' }).sql(),
    QueryBuilderError,
    'Invalid object with "oops, users" properties specified for query builder "columns" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
  )
)

test( 'last table in string',
  () => expect(
    db.build.from('a b').columns('x y').sql()
  ).toBe(
    'SELECT "b"."x", "b"."y"\nFROM "a", "b"'
  )
)

test( 'last table in array',
  () => expect(
    db.build.from(['a', 'b']).columns('x y').sql()
  ).toBe(
    'SELECT "b"."x", "b"."y"\nFROM "a" AS "b"'
  )
)

test( 'last table in multiple tables',
  () => expect(
    db.build.from('a', 'b').columns('x y').sql()
  ).toBe(
    'SELECT "b"."x", "b"."y"\nFROM "a", "b"'
  )
)

test( 'table with alias',
  () => expect(
    db.build.from({ table: 'a', as: 'b' }).columns('x y').sql()
  ).toBe(
    'SELECT "b"."x", "b"."y"\nFROM "a" AS "b"'
  )
)

test( 'column with alias from table',
  () => expect(
    db.build.from({ table: 'a', as: 'b' }).columns({ column: 'x', as: 'y' }).sql()
  ).toBe(
    'SELECT "b"."x" AS "y"\nFROM "a" AS "b"'
  )
)

test( 'interspersing table() methods',
  () => expect(
    db.build.from('a d').table('a').columns('b c').table('d').columns('e f').sql()
  ).toBe(
    'SELECT "a"."b", "a"."c", "d"."e", "d"."f"\nFROM "a", "d"'
  )
)

test( 'interspersing table() and prefix() methods',
  () => expect(
    db.build.from('a d').table('a').prefix('user_').columns('b c').table('d').prefix('company_').columns('e f').sql()
  ).toBe(
    'SELECT "a"."b" AS "user_b", "a"."c" AS "user_c", "d"."e" AS "company_e", "d"."f" AS "company_f"\nFROM "a", "d"'
  )
)

test( 'prefix() is ignored when alias is defined',
  () => expect(
    db.build.from('a').prefix('user_').columns('b', ['c', 'just_c']).sql()
  ).toBe(
    'SELECT "a"."b" AS "user_b", "a"."c" AS "just_c"\nFROM "a"'
  )
)

test( 'prefix() can be blanked',
  () => expect(
    db.build.from('a').prefix('user_').columns('b').prefix().columns('c').sql()
  ).toBe(
    'SELECT "a"."b" AS "user_b", "a"."c"\nFROM "a"'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Columns.generateSQL('a')
  ).toBe(
    'SELECT a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Columns.generateSQL(['a', 'b'])
  ).toBe(
    'SELECT a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)

