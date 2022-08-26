import test from 'ava';
import Record from '../../src/Record.js';
import { createDatabase, databaseConfig } from '../library/database.js';
import { usersConfig, createUsers } from '../library/users.js'

class User extends Record {
  hello() {
    return `Hello ${this.forename} ${this.surname}`;
  }
}

export const database = createDatabase({
  ...databaseConfig,
  tables: {
    users: {
      ...usersConfig,
      record: User
    }
  }
});

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'fetchOne({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.fetchOne({ surname: "Badger" }).record();
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