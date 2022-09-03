import test from 'ava';
import { createUsers, usersWithCustomRecord, databaseWithCustomRecord, User } from '../library/users.js'

const database = databaseWithCustomRecord;
const users = usersWithCustomRecord;

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
    t.true( badger instanceof User, 'badger is a User');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
    t.is( badger.hello(), 'Hello Bobby Badger' );
  }
)

test.after(
  () => database.destroy()
)