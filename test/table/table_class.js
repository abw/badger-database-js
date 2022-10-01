import test from 'ava';
import Table from '../../src/Table.js';
import { connect } from '../../src/Database.js';

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

test.before(
  'connect to database',
  async t => {
    db = await connect(dbConfig);
    t.pass()
  }
);

test.serial(
  'create users table',
  async t => {
    const users = await db.table('users');
    const create = await users.run('create');
    t.is(create.changes, 0);
  }
)

test.serial(
  'insert users',
  async t => {
    const users = await db.table('users');
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
    ]);
    t.is(insert.length, 3);
  }
)

test.serial(
  'fetch badgers',
  async t => {
    const users   = await db.table('users');
    const badgers = await users.badgers();
    t.is( badgers.length, 2 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[1].name, 'Brian Badger' );
  }
)

test.after(
  'destroy',
  () => db.destroy()
)

