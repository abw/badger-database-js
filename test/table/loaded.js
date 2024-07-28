import { expect, test } from 'vitest'
import Table from '../../src/Table.js'
import { connect } from '../../src/Database.js'
import { pass } from '../library/expect.js'

export class Users extends Table {
  admins() {
    return this.allRows({ admin: 1 });
  }
  loaded(row, options) {
    // console.log('LOADED: ', row);
    row.loaded = true;
    row.admin  = Boolean(row.admin);
    return super.loaded(row, options);
  }
}

let db;
const dbConfig = {
  database: 'sqlite:memory',
  tables: {
    users: {
      columns:    'id name email animal admin',
      tableClass: Users,
      queries: {
        create: `
          CREATE TABLE users (
            id     INTEGER PRIMARY KEY ASC,
            name   TEXT,
            email  TEXT,
            animal TEXT,
            admin  INTEGER
          )`
      }
    },
  }
}

test( 'connect',
  () => {
    db = connect(dbConfig);
    pass()
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
    const users = await db.table('users');
    const insert = await users.insert(
      [
        {
          name:   'Bobby Badger',
          email:  'bobby@badgerpower.com',
          animal: 'Badger',
          admin:  1,
        },
        {
          name:   'Brian Badger',
          email:  'brian@badgerpower.com',
          animal: 'Badger',
          admin:  1,
        },
        {
          name:   'Frankie Ferret',
          email:  'frank@ferret.com',
          animal: 'Ferret',
          admin:  0,
        }
      ],
      { reload: true }
    );
    expect(insert.length).toBe(3)
    expect(insert[0].loaded).toBe(true)
    expect(insert[1].loaded).toBe(true)
    expect(insert[2].loaded).toBe(true)
    expect(insert[0].admin).toBe(true)
    expect(insert[1].admin).toBe(true)
    expect(insert[2].admin).toBe(false)
  }
)

test( 'fetch admin rows',
  async () => {
    const users   = await db.table('users');
    const badgers = await users.admins();
    expect(badgers.length).toBe(2)
    expect(badgers[0].name).toBe('Bobby Badger')
    expect(badgers[1].name).toBe('Brian Badger')
    expect(badgers[0].loaded).toBe(true)
    expect(badgers[1].loaded).toBe(true)
    expect(badgers[0].admin).toBe(true)
    expect(badgers[1].admin).toBe(true)
  }
)

test( 'fetch single record',
  async () => {
    const users  = await db.table('users')
    const badger = await users.fetchOneRecord({ name: 'Bobby Badger' })
    expect(badger.loaded).toBe(true)
    expect(badger.admin).toBe(true)
  }
)

test( 'insert row with reload',
  async () => {
    const users  = await db.table('users')
    const stoat  = await users.insert(
      {
        name:  'Simon Stoat',
        email: 'simon@badgerpower.com',
        admin: 1
      },
      { reload: true }
    );
    expect(stoat.loaded).toBe(true)
    expect(stoat.admin).toBe(true)
  }
)

test( 'insert record',
  async () => {
    const users  = await db.table('users')
    const nellie = await users.insertOneRecord(
      {
        name:  'Nellie the Elephant',
        email: 'nellie@badgerpower.com',
        admin: 1
      },
    );
    expect(nellie.loaded).toBe(true)
    expect(nellie.admin).toBe(true)
  }
)

test( 'update record',
  async () => {
    const users  = await db.table('users');
    const nellie = await users.fetchOneRecord(
      {
        name:  'Nellie the Elephant',
      },
    );
    expect(nellie.loaded).toBe(true)
    expect(nellie.admin).toBe(true)
    await nellie.update({ name: 'Nellie the Ellie', admin: 0 })
    expect(nellie.loaded).toBe(true)
    expect(nellie.admin).toBe(false)
    expect(nellie.name).toBe('Nellie the Ellie')
  }
)

test( 'disconnect',
  () => db.disconnect()
)

