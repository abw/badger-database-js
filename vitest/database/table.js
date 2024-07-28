import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;
let users;

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id:readonly name:required email:required'
        }
      }
    })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'create',
  async () => {
    const create = await db.run(
      `CREATE TABLE user (
        id INTEGER PRIMARY KEY ASC,
        name TEXT,
        email TEXT
      )`
    );
    expect(create.changes).toBe(0)
  }
)

test( 'get users tables',
  async () => {
    users = await db.table('users')
    expect(users.table).toBe('users')
  }
)

test( 'users table id',
  () => expect(users.id).toBe('id')
)

test( 'users table keys',
  () => expect(users.keys.join(',')).toBe('id')
)

test( 'disconnect',
  () => db.disconnect()
)
