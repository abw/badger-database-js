import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        people: {
          columns: 'a b c'
        },
        users: {
          table: 'user',
          columns: 'a b c'
        },
      }
    })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'default name',
  async () => {
    const people = await db.table('people')
    expect(people.table).toBe('people')
  }
)

test( 'custom name',
  async () => {
    const users = await db.table('users')
    expect(users.table).toBe('user')
  }
)

test( 'disconnect',
  () => db.disconnect()
)