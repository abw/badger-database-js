import test from 'ava';
import { database } from '../../src/Database.js';

let db;
const dbConfig = {
  engine: 'sqlite:memory',
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

test.before(
  'connect to database',
  async t => {
    db = await database(dbConfig);
    t.pass()
  }
);

test.serial(
  'create users table',
  async t => {
    const users = await db.table('users');
    t.is(users.table, 'user');
    const create = await users.run('create');
    t.is(create.changes, 0);
  }
)


test.serial(
  'insert({ ...Frank Ferret... })',
  async t => {
    const users = await db.table('users');
    const insert = await users.insert({
      forename: 'Frank',
      surname:  'Ferret',
      email:    'frank@ferret.com'
    });
    t.is(insert.id, 1);
    const rows = await users.select({ id: insert.id })
    const ferret = rows[0];
    t.is(ferret.forename, 'Frank');
    t.is(ferret.surname, 'Ferret');
    t.is(ferret.id, 1);
  }
)

test.serial(
  'update({ ...Frankie Ferret... })',
  async t => {
    const users = await db.table('users');
    const update = await users.update(
      { forename: 'Frankie' },
      { email:    'frank@ferret.com' }
    );
    t.is(update.changes, 1);
    const rows = await users.select({ email: 'frank@ferret.com' })
    const frankie = rows[0];
    t.is(frankie.forename, 'Frankie');
    t.is(frankie.surname, 'Ferret');
  }
)

//-----------------------------------------------------------------------------
// Cleanup
//-----------------------------------------------------------------------------
test.after(
  () => db.destroy()
)