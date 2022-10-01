import test from 'ava';
import { connect, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'fetchRow({ surname: "Stoat" })',
  async t => {
    const stoat = await users.fetchRow({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
  }
)

test.serial(
  'fetchRow({ surname: "Badger" })',
  async t => {
    const badger = await users.fetchRow({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.serial(
  'fetchRow({ surname: "Mongoose" })',
  async t => {
    const mongoose = await users.fetchRow({ surname: "Mongoose" });
    t.is( mongoose, undefined );
  }
)

test.after(
  () => database.destroy()
)