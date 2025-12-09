import { expect, test } from 'vitest'
import Returning from '../../src/Builder/Returning.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'returning',
  () => expectOpTypeSql(
    db.build.returning('a'),
    Returning,
    'RETURNING "a"'
  )
)

test( 'multiple columns',
  () => expectOpTypeSql(
    db.build.returning('a b c'),
    Returning,
    'RETURNING "a", "b", "c"'
  )
)

test( 'multiple tables with commas',
  () => expectOpTypeSql(
    db.build.returning('a, b,c, d'),
    Returning,
    'RETURNING "a", "b", "c", "d"'
  )
)

test( 'star',
  () => expectOpTypeSql(
    db.build.returning('*'),
    Returning,
    'RETURNING *'
  )
)

test( 'table star',
  () => expectOpTypeSql(
    db.build.returning('a.*'),
    Returning,
    'RETURNING "a".*'
  )
)

test( 'object with columns',
  () => expectOpTypeSql(
    db.build.returning({ columns: 'id email company.*' }),
    Returning,
    'RETURNING "id", "email", "company".*'
  )
)

test( 'object with column and alias',
  () => expectOpTypeSql(
    db.build.returning({ column: 'email', as: 'email_address' }),
    Returning,
    'RETURNING "email" AS "email_address"'
  )
)

test( 'object with column, table and alias',
  () => expectOpTypeSql(
    db.build.returning({ table: 'users', column: 'email', as: 'email_address' }),
    Returning,
    'RETURNING "users"."email" AS "email_address"'
  )
)

test( 'object with table.column and alias',
  () => expectOpTypeSql(
    db.build.returning({ column: 'users.email', as: 'email_address' }),
    Returning,
    'RETURNING "users"."email" AS "email_address"'
  )
)

test( 'object with columns and table',
  () => expectOpTypeSql(
    db.build.returning({ table: 'users', columns: 'id email' }),
    Returning,
    'RETURNING "users"."id", "users"."email"'
  )
)

test( 'object with column and table',
  () => expectOpTypeSql(
    db.build.returning({ table: 'users', column: 'id email' }),
    Returning,
    'RETURNING "users"."id", "users"."email"'
  )
)

test( 'object with columns and prefix',
  () => expectOpTypeSql(
    db.build.returning({ columns: 'id email', prefix: 'user_' }),
    Returning,
    'RETURNING "id" AS "user_id", "email" AS "user_email"'
  )
)

test( 'object with columns, table and prefix',
  () => expectOpTypeSql(
    db.build.returning({ table: 'users', columns: 'id email', prefix: "user_" }),
    Returning,
    'RETURNING "users"."id" AS "user_id", "users"."email" AS "user_email"'
  )
)

test( 'two element array',
  () => expectOpTypeSql(
    db.build.returning(['email', 'email_address']),
    Returning,
    'RETURNING "email" AS "email_address"'
  )
)

test( 'two element array with table',
  () => expectOpTypeSql(
    db.build.returning(['users.email', 'email_address']),
    Returning,
    'RETURNING "users"."email" AS "email_address"'
  )
)

test( 'three element array',
  () => expectOpTypeSql(
    db.build.returning(['users', 'email', 'email_address']),
    Returning,
    'RETURNING "users"."email" AS "email_address"'
  )
)

test( 'four element array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.returning(['users', 'email', 'email_address', 'oops']).sql(),
    QueryBuilderError,
    'Invalid array with 4 items specified for query builder "returning" component. Expected [column, alias] or [table, column, alias].'
  )
)

test( 'columns with table name',
  () => expectOpTypeSql(
    db.build.returning('x.b c'),
    Returning,
    'RETURNING "x"."b", "c"'
  )
)

test( 'sql in object',
  () => expectOpTypeSql(
    db.build.returning({ sql: 'b as bravo' }),
    Returning,
    'RETURNING b as bravo'
  )
)

test( 'tagged sql',
  () => expectOpTypeSql(
    db.build.returning(sql`b as bravo`),
    Returning,
    'RETURNING b as bravo'
  )
)

test( 'multiple items',
  () => expectOpTypeSql(
    db.build.returning('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' }),
    Returning,
    'RETURNING "b", "c", "d", "e" AS "f", "x" AS "y"'
  )
)


test( 'columns with table name and prefix in object',
  () => expectOpTypeSql(
    db.build
      .returning(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      ),
    Returning,
    'RETURNING "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"'
  )
)

test( 'invalid object',
  () => expectToThrowErrorTypeMessage(
    // @ts-expect-error: deliberate mistake to check error reporting
    () => db.build.returning({ users: 'email email_address', oops: 'This is wrong' }).sql(),
    QueryBuilderError,
    'Invalid object with "oops, users" properties specified for query builder "returning" component.  Valid properties are "columns", "column", "table", "prefix" and "as".'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Returning.generateSQL('a')
  ).toBe(
    'RETURNING a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Returning.generateSQL(['a', 'b'])
  ).toBe(
    'RETURNING a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
