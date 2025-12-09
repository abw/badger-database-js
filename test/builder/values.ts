import { expect, test } from 'vitest'
import Values from '../../src/Builder/Values.js'
import { connect } from '../../src/Database.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'values value',
  () => {
    const op = db.build.values(10, 'b');
    expect(op).toBeInstanceOf(Values)
    expect(op.sql()).toBe('')
    expect(op.allValues()).toStrictEqual([10, 'b'])
  }
)

test( 'values',
  () => {
    const op = db.build.values([10, 20]);
    expect(op).toBeInstanceOf(Values)
    expect(op.sql()).toBe('')
    expect(op.allValues()).toStrictEqual([10, 20])
  }
)

test( 'disconnect',
  () => db.disconnect()
)