import { expect, test } from 'vitest'
import Select from '../../src/Builder/Select.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'select',
  () => expectOpTypeSql(
    db.select('a'),
    Select,
    'SELECT "a"'
  )
)

test( 'multiple columns',
  () => expectOpTypeSql(
    db.select('a b c'),
    Select,
    'SELECT "a", "b", "c"'
  )
)

test( 'multiple tables with commas',
  () => expectOpTypeSql(
    db.select('a, b,c, d'),
    Select,
    'SELECT "a", "b", "c", "d"'
  )
)

test( 'star',
  () => expectOpTypeSql(
    db.select('*'),
    Select,
    'SELECT *'
  )
)

test( 'table star',
  () => expectOpTypeSql(
    db.select('a.*'),
    Select,
    'SELECT "a".*'
  )
)

test( 'object with columns',
  () => expectOpTypeSql(
    db.select({ columns: 'id email company.*' }),
    Select,
    'SELECT "id", "email", "company".*'
  )
)

test( 'object with column and alias',
  () => expectOpTypeSql(
    db.select({ column: 'email', as: 'email_address' }),
    Select,
    'SELECT "email" AS "email_address"'
  )
)

test( 'object with column, table and alias',
  () => expectOpTypeSql(
    db.select({ table: 'users', column: 'email', as: 'email_address' }),
    Select,
    'SELECT "users"."email" AS "email_address"'
  )
)

test( 'object with table.column and alias',
  () => expectOpTypeSql(
    db.select({ column: 'users.email', as: 'email_address' }),
    Select,
    'SELECT "users"."email" AS "email_address"'
  )
)

test( 'object with columns and table',
  () => expectOpTypeSql(
    db.select({ table: 'users', columns: 'id email' }),
    Select,
    'SELECT "users"."id", "users"."email"'
  )
)

test( 'object with column and table',
  () => expectOpTypeSql(
    db.select({ table: 'users', column: 'id email' }),
    Select,
    'SELECT "users"."id", "users"."email"'
  )
)

test( 'object with columns and prefix',
  () => expectOpTypeSql(
    db.select({ columns: 'id email', prefix: 'user_' }),
    Select,
    'SELECT "id" AS "user_id", "email" AS "user_email"'
  )
)

test( 'object with columns, table and prefix',
  () => expectOpTypeSql(
    db.select({ table: 'users', columns: 'id email', prefix: "user_" }),
    Select,
    'SELECT "users"."id" AS "user_id", "users"."email" AS "user_email"'
  )
)

test( 'two element array',
  () => expectOpTypeSql(
    db.select(['email', 'email_address']),
    Select,
    'SELECT "email" AS "email_address"'
  )
)

test( 'two element array with table',
  () => expectOpTypeSql(
    db.select(['users.email', 'email_address']),
    Select,
    'SELECT "users"."email" AS "email_address"'
  )
)

test( 'three element array',
  () => expectOpTypeSql(
    db.select(['users', 'email', 'email_address']),
    Select,
    'SELECT "users"."email" AS "email_address"'
  )
)

test( 'four element array',
  () => expectToThrowErrorTypeMessage(
    () => db.select(['users', 'email', 'email_address', 'oops']).sql(),
    QueryBuilderError,
    'Invalid array with 4 items specified for query builder "select" component. Expected [column, alias] or [table, column, alias].'
  )
)

test( 'columns with table name',
  () => expectOpTypeSql(
    db.select('x.b c'),
    Select,
    'SELECT "x"."b", "c"'
  )
)

test( 'sql in object',
  () => expectOpTypeSql(
    db.select({ sql: 'b as bravo' }),
    Select,
    'SELECT b as bravo'
  )
)

test( 'tagged sql',
  () => expectOpTypeSql(
    db.select(sql`b as bravo`),
    Select,
    'SELECT b as bravo'
  )
)

test( 'multiple items',
  () => expectOpTypeSql(
    db.select('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' }),
    Select,
    'SELECT "b", "c", "d", "e" AS "f", "x" AS "y"'
  )
)

test( 'columns with table name and prefix in object',
  () => expectOpTypeSql(
    db
      .select(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      ),
    Select,
    'SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"'
  )
)

test( 'invalid object',
  () => expectToThrowErrorTypeMessage(
    () => db.select({ users: 'email email_address', oops: 'This is wrong' }).sql(),
    QueryBuilderError,
    'Invalid object with "oops, users" properties specified for query builder "select" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Select.generateSQL('a')
  ).toBe(
    'SELECT a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Select.generateSQL(['a', 'b'])
  ).toBe(
    'SELECT a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
