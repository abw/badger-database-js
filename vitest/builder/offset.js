import { expect, test } from 'vitest'
import Offset from '../../src/Builder/Offset.js'
import { connect } from '../../src/Database.js'
import { expectOpTypeSql } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'offset',
  () => expectOpTypeSql(
    db.build.offset(10),
    Offset,
    'OFFSET 10'
  )
)

test( 'offset called multiple times',
  () => expectOpTypeSql(
    db.build.offset(10).offset(20),
    Offset,
    'OFFSET 20'
  )
)

test( 'limit and offset',
  () => expectOpTypeSql(
    db.build.limit(10).offset(20),
    Offset,
    'LIMIT 10\nOFFSET 20'
  )
)

test( 'offset and limit',
  () => expect(
    db.build.offset(20).limit(10).sql()
  ).toBe(
    'LIMIT 10\nOFFSET 20'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Offset.generateSQL('a')
  ).toBe(
    'OFFSET a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Offset.generateSQL(['a', 'b'])
  ).toBe(
    'OFFSET b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
