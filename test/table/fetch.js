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
  'fetch({ surname: "Badger" })',
  async t => {
    const badger = await users.fetch({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.serial(
  'fetchOne({ surname: "Stoat" })',
  async t => {
    const stoat = await users.fetchOne({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
  }
)

test.serial(
  'fetchOne({ surname: "Badger" })',
  async t => {
    const error = await t.throwsAsync(
      () => users.fetchOne({ surname: "Badger" })
    );
    t.is(error.message, "fetchOne for user returned 2 records")
  }
)

test.serial(
  'fetchOne({ surname: "Mongoose" })',
  async t => {
    const error = await t.throwsAsync(
      () => users.fetchOne({ surname: "Mongoose" })
    );
    t.is(error.message, "fetchOne for user returned 0 records")
  }
)

test.serial(
  'fetchAll()',
  async t => {
    const all = await users.fetchAll();
    t.is( all.length, 3 );
    t.is( all[0].forename, 'Bobby' );
    t.is( all[1].forename, 'Brian' );
    t.is( all[2].forename, 'Simon' );
  }
)

test.serial(
  'fetchAll({ surname: "Badger" })',
  async t => {
    const badgers = await users.fetchAll({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
  }
)

test.after(
  () => database.destroy()
)