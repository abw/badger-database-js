import test from 'ava';
import Record from '../../src/Record.js';
import { database, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'fetchRow({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.fetchRow({ surname: "Badger" }).record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
    await badger.update({ forename: 'Roberto' });
    t.is( badger.forename, 'Roberto', 'badger forename is Roberto' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
  }
)

test.after(
  () => database.destroy()
)