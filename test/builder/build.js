import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'build.from',
  () => {
    const op = db.build.from('a');
    expect(op.sql()).toBe('FROM "a"')
  }
)

test( 'build.select().from()',
  () => {
    const op = db.build.select('a').from('b');
    expect(op.sql()).toBe('SELECT "a"\nFROM "b"')
  }
)

test( 'build.where().select().from()',
  () => {
    const op = db.build.where('c').select('a').from('b');
    expect(op.sql()).toBe('SELECT "a"\nFROM "b"\nWHERE "c" = ?')
  }
)

test( 'stringification',
  () => {
    const op = db.build.where('c').select('a').from('b');
    expect(`QUERY: ${op}`).toBe('QUERY: SELECT "a"\nFROM "b"\nWHERE "c" = ?')
  }
)

test( 'disconnect',
  () => {
    db.disconnect()
  }
)
