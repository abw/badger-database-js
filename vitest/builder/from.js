import { expect, test } from 'vitest'
import From from '../../src/Builder/From.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'from',
  () => expectOpTypeSql(
    db.build.from('a'),
    From,
    'FROM "a"'
  )
)

test( 'tables string',
  () => expect(
    db.build.from('a, b c').sql()
  ).toBe(
    'FROM "a", "b", "c"'
  )
)

test( 'multiple tables as arguments',
  () => expect(
    db.build.from('a', 'b', 'c').sql()
  ).toBe(
    'FROM "a", "b", "c"'
  )
)

test( 'table with alias',
  () => expect(
    db.build.from(['a', 'b']).sql()
  ).toBe(
    'FROM "a" AS "b"'
  )
)

test( 'three element array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from(['users', 'email', 'email_address']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "from" component. Expected [table, alias].'
  )
)

test( 'from sql in object',
  () => expect(
    db.build.from({ sql: 'a as alpha' }).sql()
  ).toBe(
    'FROM a as alpha'
  )
)

test( 'from tagged sql',
  () => expect(
    db.build.from(sql`a as alpha`).sql()
  ).toBe(
    'FROM a as alpha'
  )
)

test( 'from multiple items',
  () => expect(
    db.build.from('a', ['b', 'c'], { sql: 'd as delta'}).sql()
  ).toBe(
    'FROM "a", "b" AS "c", d as delta'
  )
)

test( 'from table in object',
  () => expect(
    db.build.from({ table: 'a' }).sql()
  ).toBe(
    'FROM "a"'
  )
)

test( 'from tables in object',
  () => expect(
    db.build.from({ tables: 'a b c' }).sql()
  ).toBe(
    'FROM "a", "b", "c"'
  )
)

test( 'from aliased table',
  () => expect(
    db.build.from({ table: 'a', as: 'b' }).sql()
  ).toBe(
    'FROM "a" AS "b"'
  )
)

test( 'invalid object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.from({ users: 'email email_address', oops: 'This is wrong' }).sql(),
    QueryBuilderError,
    'Invalid object with "oops, users" properties specified for query builder "from" component.  Valid properties are "tables", "table" and "as".'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    From.generateSQL('a')
  ).toBe(
    'FROM a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    From.generateSQL(['a', 'b'])
  ).toBe(
    'FROM a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
