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
    const badger = await users.fetchOne({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.serial(
  'fetchOne({ surname: "Mongoose" })',
  async t => {
    const mongoose = await users.fetchOne({ surname: "Mongoose" });
    t.is( mongoose, undefined );
  }
)

test.after(
  () => database.destroy()
)