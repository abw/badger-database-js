import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;
const dbConfig = {
  database: 'sqlite:memory',
  tables: {
    users: {
      columns: 'id forename surname email animal',
      table:   'user',
      queries: {
        create: `
          CREATE TABLE user (
            id        INTEGER PRIMARY KEY ASC,
            forename  TEXT,
            surname   TEXT,
            email     TEXT,
            animal    TEXT
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
    expect(users.table).toBe('user')
    const create = await users.run('create')
    expect(create.changes).toBe(0)
  }
)

test( 'insert({ ...Frank Ferret... })',
  async () => {
    const users = await db.table('users')
    const insert = await users.insert({
      forename: 'Frank',
      surname:  'Ferret',
      email:    'frank@ferret.com'
    })
    expect(insert.id).toBe(1)
    const ferret = await users.oneRow({ id: insert.id })
    expect(ferret.forename).toBe('Frank')
    expect(ferret.surname).toBe('Ferret')
    expect(ferret.id).toBe(1)
  }
)

test( 'update({ ...Frankie Ferret... })',
  async () => {
    const users = await db.table('users');
    const update = await users.update(
      { forename: 'Frankie' },
      { email:    'frank@ferret.com' }
    )
    expect(update.changes).toBe(1)
    const frankie = await users.oneRow({ email: 'frank@ferret.com' })
    expect(frankie.forename).toBe('Frankie')
    expect(frankie.surname).toBe('Ferret')
  }
)

test( 'update record',
  async () => {
    const users   = await db.table('users')
    const frankie = await users.oneRecord(
      { email:    'frank@ferret.com' }
    )
    expect(frankie.forename).toBe('Frankie')
    expect(frankie.surname).toBe('Ferret')
    await frankie.update({ forename: 'Francis' })
    expect(frankie.forename).toBe('Francis')
  }
)

test( 'disconnect',
  () => db.disconnect()
)