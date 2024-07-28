import { expect, test } from 'vitest'
import Table from '../../src/Table.js'
import { connect } from '../../src/Database.js'

let db;

class Users extends Table {
  configure(schema) {
    schema.columns = 'id name email'
  }
}

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: Users,
      }
    })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'fetch users',
  async () => {
    const users = await db.table('users')
    expect(users).toBeInstanceOf(Table)
    expect(users.columns.id.column).toBe('id')
  }
)

test( 'disconnect',
  () => db.disconnect()
)