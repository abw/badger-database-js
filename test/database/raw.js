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
    const rows = await database.raw('SELECT forename FROM user WHERE email="bobby@badgerpower.com"');
    t.is( rows[0].forename, 'Bobby' );
  }
)

test.after(
  () => database.destroy()
)