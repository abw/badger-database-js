import { expect, test } from 'vitest'
import Table from '../../src/Table.js'
import Tables from '../../src/Tables.js'
import { connect } from '../../src/Database.js'

let db;
let fetchedTable = '';

// dummy Tables class which sets fetchTable so we can check
// it's being called
class MyTables extends Tables {
  table(name) {
    fetchedTable = name;
    return this.tables[name];
  }
}

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tablesClass: MyTables,
      tables: {
        users: {
          columns: 'id name email'
        }
      }
    })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'users table',
  async () => {
    const users = await db.table('users');
    expect(users).toBeInstanceOf(Table)
    expect( fetchedTable).toBe('users')
  }
)

test( 'disconnect',
  () => db.disconnect()
)