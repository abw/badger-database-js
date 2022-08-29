import test from 'ava';
import { createUsers, usersWithCustomTable, databaseWithCustomTable } from '../library/users.js'

const database = databaseWithCustomTable;
const users = usersWithCustomTable;

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'badgers()',
  async t => {
    const badgers = await users.badgers();
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badgers[0].surname, 'Badger', 'badger surname is Badger' );
    t.is( badgers[1].forename, 'Brian', 'badger forename is Brian' );
    t.is( badgers[1].surname, 'Badger', 'badger surname is Badger' );
  }
)

test.after(
  () => database.destroy()
)