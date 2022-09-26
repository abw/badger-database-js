import test from 'ava';
import Record from '../src/Record.js';
import { database, createUsers } from '../test/library/users.js'
import proxymise from 'proxymise'

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'database.table.then.fetchRow.record()',
  async t => {
    const badger = await database
      .table('users')
      .then(
        users => users.fetchRow({ surname: "Badger" }).record()
      );
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
  }
)

test.serial(
  'proxymise(database).table.fetchRow.record()',
  async t => {
    const badger = await proxymise(database)
      .table('users')
      .fetchRow({ surname: "Badger" })
      .where({ email: 'bobby@badgerpower.com' })
      // works without record
      // .record()
    // t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
  }
)

test.after(
  () => database.destroy()
)