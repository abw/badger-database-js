import test from 'ava';
import { connect } from '../../src/Database.js'

let db, users, contacts, brian, home, office, mobile;

test.before( 'connect',
  t => {
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
    t.pass();
  }
)

test.serial( 'drop tables',
  async t => {
    await db.run('dropContacts')
    await db.run('dropUsers')
    t.pass();
  }
)

test.serial( 'create tables',
  async t => {
    await db.run('createUsers')
    await db.run('createContacts')
    t.pass();
  }
)

test.serial( 'fetch tables',
  async t => {
    users = await db.table('users')
    contacts = await db.table('contacts')
    t.truthy(users);
    t.truthy(contacts);
  }
)

test.serial( 'create user',
  async t => {
    brian = await users.insertRecord({
      name: 'Brian Badger',
      email: 'brian@badgerpower.com'
    });
    t.truthy(brian);
  }
)

test.serial( 'add contacts',
  async t => {
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
    t.truthy(home);
    t.truthy(office);
    t.truthy(mobile);
  }
)

test.serial( 'contactsById',
  async t => {
    const cbi = await brian.contactsById;
    t.is( cbi[home.id].number,   '01234 567890' );
    t.is( cbi[office.id].number, '04321 098765' );
    t.is( cbi[mobile.id].number, '07979 079790' );
  }
)

test.serial( 'contactsByLocation',
  async t => {
    const cbl = await brian.contactsByLocation;
    t.is( cbl.Home.number,   '01234 567890' );
    t.is( cbl.Office.number, '04321 098765' );
    t.is( cbl.Mobile.number, '07979 079790' );
  }
)

test.serial( 'NumbersByLocation',
  async t => {
    const nbl = await brian.numbersByLocation;
    t.is( nbl.Home,   '01234 567890' );
    t.is( nbl.Office, '04321 098765' );
    t.is( nbl.Mobile, '07979 079790' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)