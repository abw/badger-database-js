import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { pass } from '../library/expect.js'

let db;
const dbConfig = {
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id forename surname email',
      table:   'user',
      queries: {
        create: `
          CREATE TABLE user (
            id        INTEGER PRIMARY KEY ASC,
            forename  TEXT,
            surname   TEXT,
            email     TEXT
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
    expect(users.table).toBe('user')
    const create = await users.run('create')
    expect(create.changes).toBe(0)
  }
)

test( 'insert([{ ...Roger Rabbit... }, { ...Richard Rabbit... }])',
  async () => {
    const users = await db.table('users');
    const inserts = await users.insert([
      {
        forename: 'Roger',
        surname:  'Rabbit',
        email:    'roger@rabbit.com'
      },
      {
        forename: 'Richard',
        surname:  'Rabbit',
        email:    'richard@rabbit.com'
      },
    ]);
    expect(inserts.length).toBe(2)
    const rabbits = await users.allRows({ surname: 'Rabbit' })
    expect(rabbits[0].forename).toBe('Roger')
    expect(rabbits[1].forename).toBe('Richard')
  }
)

test( 'delete({ ...Roger Rabbit... })',
  async () => {
    const users = await db.table('users');
    await users.delete({
      email:    'roger@rabbit.com'
    });
    const rabbits = await users.allRows({ surname: 'Rabbit' })
    expect(rabbits.length).toBe(1)
    expect(rabbits[0].forename).toBe('Richard')
  }
)

test( 'disconnect',
  () => db.disconnect()
)