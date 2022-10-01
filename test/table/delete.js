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
    const rabbits = await users.fetchAll({ surname: 'Rabbit' })
    t.is( rabbits[0].forename, 'Roger' );
    t.is( rabbits[1].forename, 'Richard' );
  }
)

test.serial(
  'delete({ ...Roger Rabbit... })',
  async t => {
    const users = await db.table('users');
    await users.delete({
      email:    'roger@rabbit.com'
    });
    const rabbits = await users.fetchAll({ surname: 'Rabbit' })
    t.is( rabbits.length, 1);
    t.is( rabbits[0].forename, 'Richard' );
  }
)

test.after(
  'destroy',
  () => db.destroy()
)