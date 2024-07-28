import { expect, test } from 'vitest'
import Order from '../../src/Builder/Order.js'
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

test( 'order',
  () => expectOpTypeSql(
    db.build.order('a'),
    Order,
    'ORDER BY "a"'
  )
)

test( 'order string with multiple columns',
  () => expectOpTypeSql(
    db.build.order('a b c.d'),
    Order,
    'ORDER BY "a", "b", "c"."d"'
  )
)

test( 'order string with table name',
  () => expectOpTypeSql(
    db.build.order('a.b'),
    Order,
    'ORDER BY "a"."b"'
  )
)

test( 'orderBy string with table name',
  () => expectOpTypeSql(
    db.build.orderBy('a.b'),
    Order,
    'ORDER BY "a"."b"'
  )
)

test( 'order array with two elements',
  () => expectOpTypeSql(
    db.build.order(['a.b', 'DESC']),
    Order,
    'ORDER BY "a"."b" DESC'
  )
)

test( 'order array with one element',
  () => expectOpTypeSql(
    db.build.order(['a.b']),
    Order,
    'ORDER BY "a"."b"'
  )
)

test( 'order object with column',
  () => expectOpTypeSql(
    db.build.order({ column: 'a.b' }),
    Order,
    'ORDER BY "a"."b"'
  )
)

test( 'order object with column and desc',
  () => expectOpTypeSql(
    db.build.order({ column: 'a.b', desc: true }),
    Order,
    'ORDER BY "a"."b" DESC'
  )
)

test( 'order object with column and asc',
  () => expectOpTypeSql(
    db.build.order({ column: 'a.b', asc: true }),
    Order,
    'ORDER BY "a"."b" ASC'
  )
)

test( 'order object with column and direction',
  () => expectOpTypeSql(
    db.build.order({ column: 'a.b', direction: 'DESC' }),
    Order,
    'ORDER BY "a"."b" DESC'
  )
)

test( 'order object with column and dir',
  () => expectOpTypeSql(
    db.build.order({ column: 'a.b', dir: 'DESC' }),
    Order,
    'ORDER BY "a"."b" DESC'
  )
)

test( 'order object with columns',
  () => expectOpTypeSql(
    db.build.order({ columns: 'a b c' }),
    Order,
    'ORDER BY "a", "b", "c"'
  )
)

test( 'order object with columns and dir',
  () => expectOpTypeSql(
    db.build.order({ columns: 'a b c', dir: 'DESC' }),
    Order,
    'ORDER BY "a", "b", "c" DESC'
  )
)

test( 'order object with columns and desc',
  () => expectOpTypeSql(
    db.build.order({ columns: 'a b c', desc: true }),
    Order,
    'ORDER BY "a", "b", "c" DESC'
  )
)

test( 'order object with sql',
  () => expectOpTypeSql(
    db.build.order({ sql: 'Next Tuesday' }),
    Order,
    'ORDER BY Next Tuesday'
  )
)

test( 'order with sql tagged template literal',
  () => expectOpTypeSql(
    db.build.order(sql`Next Tuesday`),
    Order,
    'ORDER BY Next Tuesday'
  )
)

test( 'invalid order array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.order(['wibble', 'wobble', 'wubble']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "order" component. Expected [column, direction] or [column].',
  )
)

test( 'invalid order object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.order({ table: 'a', from: 'b' }).sql(),
    QueryBuilderError,
    'Invalid object with "from, table" properties specified for query builder "order" component.  Valid properties are "columns", "column", "direction", "dir", "asc" and "desc".',
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Order.generateSQL('a')
  ).toBe(
    'ORDER BY a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Order.generateSQL(['a', 'b'])
  ).toBe(
    'ORDER BY a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
