import test from 'ava';
import { connect } from '../../src/Database.js';

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
    const ferret = await users.oneRow({ id: insert.id })
    t.is(ferret.forename, 'Frank');
    t.is(ferret.surname, 'Ferret');
    t.is(ferret.id, 1);
  }
)

test.serial(
  'insert([{ ...Roger Rabbit... }, { ...Richard Rabbit... }])',
  async t => {
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
    t.is( inserts.length, 2 );
    const rabbits = await users.allRows({ surname: 'Rabbit' })
    t.is( rabbits[0].forename, 'Roger' );
    t.is( rabbits[1].forename, 'Richard' );
  }
)

test.after(
  'destroy',
  () => db.destroy()
)