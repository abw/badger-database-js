import test from 'ava';
import { database, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'fetchRows()',
  async t => {
    const all = await users.fetchRows();
    t.is( all.length, 3 );
    t.is( all[0].forename, 'Bobby' );
    t.is( all[1].forename, 'Brian' );
    t.is( all[2].forename, 'Simon' );
  }
)

test.serial(
  'fetchRows({ surname: "Badger" })',
  async t => {
    const badgers = await users.fetchRows({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
  }
)

test.serial(
  'fetchRows().where({ surname: "Badger" })',
  async t => {
    const badgers = await users.fetchRows().where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
  }
)

test.serial(
  'fetchRows({ surname: "Mongoose" })',
  async t => {
    const mongeese = await users.fetchRows({ surname: "Mongoose" });
    t.is( mongeese.length, 0 );
  }
)

test.after(
  () => database.destroy()
)