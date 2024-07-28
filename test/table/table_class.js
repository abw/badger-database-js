import { expect, test } from 'vitest'
import Table from '../../src/Table.js'
import { connect } from '../../src/Database.js'

export class Users extends Table {
  badgers() {
    return this.allRows({ animal: 'Badger' });
  }
}

let db;
const dbConfig = {
  database: 'sqlite:memory',
  tables: {
    users: {
      columns:    'id name email animal',
      tableClass: Users,
      queries: {
        create: `
          CREATE TABLE users (
            id     INTEGER PRIMARY KEY ASC,
            name   TEXT,
            email  TEXT,
            animal TEXT
          )`
      }
    },
  }
}

test( 'connect',
  () => {
    db = connect(dbConfig)
    expect(db.engine.engine).toBe('sqlite')
  }
);

test( 'create users table',
  async () => {
    const users = await db.table('users')
    const create = await users.run('create')
    expect(create.changes).toBe(0)
  }
)

test( 'insert users',
  async () => {
    const users = await db.table('users')
    const insert = await users.insert([
      {
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        animal: 'Badger'
      },
      {
        name:   'Brian Badger',
        email:  'brian@badgerpower.com',
        animal: 'Badger'
      },
      {
        name:   'Frankie Ferret',
        email:  'frank@ferret.com',
        animal: 'Ferret'
      }
    ])
    expect(insert.length).toBe(3)
  }
)

test( 'fetch badgers',
  async () => {
    const users   = await db.table('users');
    const badgers = await users.badgers();
    expect(badgers.length).toBe(2)
    expect(badgers[0].name).toBe('Bobby Badger')
    expect(badgers[1].name).toBe('Brian Badger')
  }
)

test( 'disconnect',
  () => db.disconnect()
)

