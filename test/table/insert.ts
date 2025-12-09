import { expect, test } from 'vitest'
import { connect } from '../../src/Database'
import { pass } from '../library/expect.js';
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance;

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
    const users = await db.table('users');
    expect(users.table).toBe('user')
    const create = await users.run('create');
    expect(create.changes).toBe(0)
  }
)

test( 'insert({ ...Frank Ferret... })',
  async () => {
    const users = await db.table('users');
    const insert = await users.insert({
      forename: 'Frank',
      surname:  'Ferret',
      email:    'frank@ferret.com'
    });
    expect(insert.id).toBe(1)
    const ferret = await users.oneRow({ id: insert.id })
    expect(ferret.forename).toBe('Frank')
    expect(ferret.surname).toBe('Ferret')
    expect(ferret.id).toBe(1)
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

test( 'disconnect',
  () => db.disconnect()
)