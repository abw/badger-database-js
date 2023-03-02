import test from 'ava';
import Table from '../../src/Table.js';
import { connect } from '../../src/Database.js';

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

test.before( 'connect',
  t => {
    db = connect(dbConfig);
    t.pass()
  }
);

test.serial( 'create users table',
  async t => {
    const users = await db.table('users');
    const create = await users.run('create');
    t.is(create.changes, 0);
  }
)

test.serial( 'insert users',
  async t => {
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
    t.is(insert.length, 3);
    t.true(insert[0].loaded)
    t.true(insert[1].loaded)
    t.true(insert[2].loaded)
    t.true(insert[0].admin)
    t.true(insert[1].admin)
    t.false(insert[2].admin)
  }
)

test.serial( 'fetch admin rows',
  async t => {
    const users   = await db.table('users');
    const badgers = await users.admins();
    t.is( badgers.length, 2 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[1].name, 'Brian Badger' );
    t.true( badgers[0].loaded );
    t.true( badgers[1].loaded );
    t.true( badgers[0].admin );
    t.true( badgers[1].admin );
  }
)

test.serial( 'fetch single record',
  async t => {
    const users  = await db.table('users');
    const badger = await users.fetchOneRecord({ name: 'Bobby Badger' });
    t.true( badger.loaded );
    t.true( badger.admin );
  }
)

test.serial( 'insert row with reload',
  async t => {
    const users  = await db.table('users');
    const stoat  = await users.insert(
      {
        name:  'Simon Stoat',
        email: 'simon@badgerpower.com',
        admin: 1
      },
      { reload: true }
    );
    t.true( stoat.loaded );
    t.true( stoat.admin );
  }
)

test.serial( 'insert record',
  async t => {
    const users  = await db.table('users');
    const nellie = await users.insertOneRecord(
      {
        name:  'Nellie the Elephant',
        email: 'nellie@badgerpower.com',
        admin: 1
      },
    );
    t.true( nellie.loaded );
    t.true( nellie.admin );
  }
)

test.serial( 'update record',
  async t => {
    const users  = await db.table('users');
    const nellie = await users.fetchOneRecord(
      {
        name:  'Nellie the Elephant',
      },
    );
    t.true( nellie.loaded );
    t.true( nellie.admin );
    await nellie.update({ name: 'Nellie the Ellie', admin: 0 });
    t.true( nellie.loaded );
    t.false( nellie.admin );
    t.is( nellie.name, 'Nellie the Ellie' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)

