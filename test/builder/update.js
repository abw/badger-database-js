import { expect, test } from 'vitest'
import Update from '../../src/Builder/Update.js'
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

test( 'update',
  () => expectOpTypeSql(
    db.build.update('a'),
    Update,
    'UPDATE "a"'
  )
)

test( 'tables string',
  () => expectOpTypeSql(
    db.build.update('a, b c'),
    Update,
    'UPDATE "a", "b", "c"'
  )
)

test( 'multiple tables as arguments',
  () => expectOpTypeSql(
    db.build.update('a', 'b', 'c'),
    Update,
    'UPDATE "a", "b", "c"'
  )
)

test( 'table with alias',
  () => expectOpTypeSql(
    db.build.update(['a', 'b']),
    Update,
    'UPDATE "a" AS "b"'
  )
)

test( 'from sql in object',
  () => expectOpTypeSql(
    db.build.update({ sql: 'a as alpha' }),
    Update,
    'UPDATE a as alpha'
  )
)

test( 'from tagged sql',
  () => expectOpTypeSql(
    db.build.update(sql`a as alpha`),
    Update,
    'UPDATE a as alpha'
  )
)

test( 'from multiple items',
  () => expectOpTypeSql(
    db.build.update('a', ['b', 'c'], { sql: 'd as delta'}),
    Update,
    'UPDATE "a", "b" AS "c", d as delta'
  )
)

test( 'from table in object',
  () => expectOpTypeSql(
    db.build.update({ table: 'a' }),
    Update,
    'UPDATE "a"'
  )
)

test( 'from tables in object',
  () => expectOpTypeSql(
    db.build.update({ tables: 'a b c' }),
    Update,
    'UPDATE "a", "b", "c"'
  )
)

test( 'from aliased table',
  () => expectOpTypeSql(
    db.build.update({ table: 'a', as: 'b' }),
    Update,
    'UPDATE "a" AS "b"'
  )
)


test( 'three element array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.update(['users', 'email', 'email_address']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "update" component. Expected [table, alias].'
  )
)

test( 'update set where',
  () => {
    const op = db.build.update("a").set("b").where("c")
    expect(op.sql()).toBe('UPDATE "a"\nSET "b" = ?\nWHERE "c" = ?')
    expect(op.setValues()).toStrictEqual([])
    expect(op.whereValues()).toStrictEqual([])
  }
)

test( 'update set where with values',
  () => {
    const op = db.build.update("a").set({ b: 10 }).where({ c: 20 })
    expect(op.sql()).toBe('UPDATE "a"\nSET "b" = ?\nWHERE "c" = ?')
    expect(op.setValues()).toStrictEqual([10])
    expect(op.whereValues()).toStrictEqual([20])
  }
)

test( 'invalid object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.update({ users: 'email email_address', oops: 'This is wrong' }).sql(),
    QueryBuilderError,
    'Invalid object with "oops, users" properties specified for query builder "update" component.  Valid properties are "tables", "table" and "as".'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Update.generateSQL('a')
  ).toBe(
    'UPDATE a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Update.generateSQL(['a', 'b'])
  ).toBe(
    'UPDATE a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
