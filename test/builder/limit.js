import { expect, test } from 'vitest'
import Limit from '../../src/Builder/Limit.js'
import { connect } from '../../src/Database.js'
import { expectOpTypeSql } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'limit',
  () => expectOpTypeSql(
    db.build.limit(10),
    Limit,
    'LIMIT 10'
  )
)

test( 'limit called multiple times',
  () => expectOpTypeSql(
    db.build.limit(10).limit(20),
    Limit,
    'LIMIT 20'
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Limit.generateSQL('a'),
  ).toBe(
    'LIMIT a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Limit.generateSQL(['a', 'b'])
  ).toBe(
    'LIMIT b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
