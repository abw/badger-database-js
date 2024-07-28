import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db, users, contacts, brian, home, office, mobile;

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      queries: {
        dropUsers:
          'DROP TABLE IF EXISTS "users"',
        dropContacts:
          'DROP TABLE IF EXISTS "contacts"',
        createUsers: `
          CREATE TABLE users (
            id    INTEGER PRIMARY KEY ASC,
            name  TEXT,
            email TEXT
          )`,
        createContacts: `
          CREATE TABLE contacts (
            id        INTEGER PRIMARY KEY ASC,
            number    TEXT,
            location  TEXT,
            user_id   INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )`
      },
      tables: {
        users: {
          columns: 'id name email',
          relations: {
            contactsById: 'id #> contacts.user_id',
            contactsByLocation: {
              type:  'map',
              from:  'id',
              table: 'contacts',
              to:    'user_id',
              key:   'location',
            },
            numbersByLocation: {
              relation: 'id #> contacts.user_id',
              key:   'location',
              value: 'number',
            }
          }
        },
        contacts: {
          columns: 'id user_id number location'
        }
      }
    });
    expect(db).toBeTruthy()
  }
)

test( 'drop tables',
  async () => {
    await db.run('dropContacts')
    await db.run('dropUsers')
    expect(true).toBeTruthy()
  }
)

test( 'create tables',
  async () => {
    await db.run('createUsers')
    await db.run('createContacts')
    expect(true).toBeTruthy()
  }
)

test( 'fetch tables',
  async () => {
    users = await db.table('users')
    contacts = await db.table('contacts')
    expect(users).toBeTruthy()
    expect(contacts).toBeTruthy()
  }
)

test( 'create user',
  async () => {
    brian = await users.insertRecord({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com'
    });
    expect(brian).toBeTruthy()
  }
)

test( 'add contacts',
  async () => {
    home = await contacts.insert({
      location: 'Home',
      number:   '01234 567890',
      user_id:  brian.id
    });
    office = await contacts.insert({
      location: 'Office',
      number:   '04321 098765',
      user_id:  brian.id
    });
    mobile = await contacts.insert({
      location: 'Mobile',
      number:   '07979 079790',
      user_id:  brian.id
    });
    expect(home).toBeTruthy()
    expect(office).toBeTruthy()
    expect(mobile).toBeTruthy()
  }
)

test( 'contactsById',
  async () => {
    const cbi = await brian.contactsById;
    expect( cbi[home.id].number   ).toBe( '01234 567890' )
    expect( cbi[office.id].number ).toBe( '04321 098765' )
    expect( cbi[mobile.id].number ).toBe( '07979 079790' )
  }
)

test( 'contactsByLocation',
  async () => {
    const cbl = await brian.contactsByLocation;
    expect( cbl.Home.number   ).toBe( '01234 567890' )
    expect( cbl.Office.number ).toBe( '04321 098765' )
    expect( cbl.Mobile.number ).toBe( '07979 079790' )
  }
)

test( 'NumbersByLocation',
  async () => {
    const nbl = await brian.numbersByLocation;
    expect( nbl.Home   ).toBe( '01234 567890' )
    expect( nbl.Office ).toBe( '04321 098765' )
    expect( nbl.Mobile ).toBe( '07979 079790' )
  }
)

test( 'disconnect',
  () => db.disconnect()
)