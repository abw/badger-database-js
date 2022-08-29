import test from 'ava';
import { database, createUsers } from '../library/users.js'

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'database.query()',
  async t => {
    const bobby = await database.query('user').select('forename').where({ email: 'bobby@badger.com' }).first();
    t.is( bobby.forename, 'Bobby' );
  }
)

test.after(
  () => database.destroy()
)