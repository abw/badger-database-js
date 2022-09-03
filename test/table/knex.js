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
        .knex()
        .select('forename')
        .where({ email: "bobby@badgerpower.com" })
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
        .knex()
        .insert({ forename: 'Frank', surname: 'Ferret', email: "frank@ferret.com" })
    t.is(frank[0], 4)
  }
)


test.after(
  () => database.destroy()
)