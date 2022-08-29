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
  'query()',
  async t => {
    const bobby =
      await users
        .query()
        .select('forename')
        .where({ email: "bobby@badger.com" })
        .first();
    t.deepEqual(
      bobby,
      { forename: 'Bobby' }
    )
  }
)

test.serial(
  'query().insert()',
  async t => {
    const frank =
      await users
        .query()
        .insert({ forename: 'Frank', surname: 'Ferret', email: "frank@ferret.com" })
    t.is(frank[0], 4)
  }
)


test.after(
  () => database.destroy()
)