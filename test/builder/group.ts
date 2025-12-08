import { expect, test } from 'vitest'
import Group from '../../src/Builder/Group.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { sql } from '../../src/Utils/Tags.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'group',
  () => expectOpTypeSql(
    db.build.group('a'),
    Group,
    'GROUP BY "a"'
  )
)

test( 'group string with table name',
  () => expectOpTypeSql(
    db.build.group('a.b'),
    Group,
    'GROUP BY "a"."b"'
  )
)

test( 'groupBy string with table name',
  () => expectOpTypeSql(
    db.build.groupBy('a.b'),
    Group,
    'GROUP BY "a"."b"'
  )
)

test( 'group string with multiple columns',
  () => expectOpTypeSql(
    db.build.group('a b c'),
    Group,
    'GROUP BY "a", "b", "c"'
  )
)

test( 'group array with one element',
  () => expectOpTypeSql(
    db.build.group(['a.b']),
    Group,
    'GROUP BY "a"."b"'
  )
)

test( 'group object with column',
  () => expectOpTypeSql(
    db.build.group({ column: 'a.b' }),
    Group,
    'GROUP BY "a"."b"'
  )
)

test( 'group object with columns',
  () => expectOpTypeSql(
    db.build.group({ columns: 'a b c' }),
    Group,
    'GROUP BY "a", "b", "c"'
  )
)

test( 'group object with sql',
  () => expectOpTypeSql(
    db.build.group({ sql: 'height' }),
    Group,
    'GROUP BY height'
  )
)

test( 'group with sql tagged template literal',
  () => expectOpTypeSql(
    db.build.group(sql`width`),
    Group,
    'GROUP BY width'
  )
)

test( 'invalid group array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.group(['wibble', 'wobble', 'wubble']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "group" component. Expected [column].',
  )
)

test( 'invalid group object',
  () => expectToThrowErrorTypeMessage(
    // @ts-expect-error: Deliberate mistake to test error reporting
    () => db.build.group({ table: 'a', from: 'b' }).sql(),
    QueryBuilderError,
    'Invalid object with "from, table" properties specified for query builder "group" component.  Valid properties are "columns" and "column".',
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Group.generateSQL('a')
  ).toBe(
    'GROUP BY a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Group.generateSQL(['a', 'b'])
  ).toBe(
    'GROUP BY a, b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
