import { expect, test } from 'vitest'
import Range from '../../src/Builder/Range.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'range',
  () => expectOpTypeSql(
    db.build.range(0, 9),
    Range,
    'LIMIT 10'
  )
)

test( 'range called multiple times',
  () => expectOpTypeSql(
    db.build.range(10, 19).range(20, 29),
    Range,
    'LIMIT 10\nOFFSET 20'
  )
)

test( 'range with single argument',
  () => expectOpTypeSql(
    db.build.range(100),
    Range,
    'OFFSET 100'
  )
)

test( 'range with object specifying from, to',
  () => expectOpTypeSql(
    db.build.range({ from: 100, to: 119 }),
    Range,
    'LIMIT 20\nOFFSET 100'
  )
)

test( 'range with object specifying from',
  () => expectOpTypeSql(
    db.build.range({ from: 100 }),
    Range,
    'OFFSET 100'
  )
)

test( 'range with object specifying to',
  () => expectOpTypeSql(
    db.build.range({ to: 99 }),
    Range,
    'LIMIT 100'
  )
)

test( 'range with object specifying limit',
  () => expectOpTypeSql(
    db.build.range({ limit: 100 }),
    Range,
    'LIMIT 100'
  )
)
test( 'range with object specifying offset',
  () => expectOpTypeSql(
    db.build.range({ offset: 100 }),
    Range,
    'OFFSET 100'
  )
)

test( 'range with no args',
  () => expectToThrowErrorTypeMessage(
    () => db.build.range().sql(),
    QueryBuilderError,
    'Invalid arguments with 0 items specified for query builder "range" component. Expected (from, to), (from) or object.'
  )
)

test( 'range with three args',
  () => expectToThrowErrorTypeMessage(
    () => db.build.range(10, 20, 30).sql(),
    QueryBuilderError,
    'Invalid arguments with 3 items specified for query builder "range" component. Expected (from, to), (from) or object.'
  )
)

test( 'range with invalid object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.range({ a: 10, b: 20 }).sql(),
    QueryBuilderError,
    'Invalid object with "a, b" properties specified for query builder "range" component.  Valid properties are "from", "to", "limit" and "offset".'
  )
)

test( 'range with invalid argument',
  () => expectToThrowErrorTypeMessage(
    () => db.build.range("a string").sql(),
    QueryBuilderError,
    'Invalid argument specified for query builder "range" component. Expected (from, to), (from) or object.'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
