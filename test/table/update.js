import test from 'ava';
import { createUsers, usersWithCustomRecord, databaseWithCustomRecord } from '../library/users.js'

const database = databaseWithCustomRecord;
const users = usersWithCustomRecord;

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'update()',
  async t => {
    const badgers = await users.update({ forename: 'Roberto' }, { email: 'bobby@badger.com' });
    t.is( badgers.length, 1 );
    t.is( badgers[0].forename, 'Roberto' );
    const badger = await users.fetchRow({ email: 'bobby@badger.com' });
    t.is( badger.forename, 'Roberto' );
  }
)

test.serial(
  'update() many',
  async t => {
    const badgers = await users.update({ is_admin: 1 }, { surname: 'Badger' });
    t.is(badgers.length, 2)
    t.is( badgers[0].forename, 'Roberto' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[1].is_admin, 1 );

    const badgers2 = await users.fetchRows({ surname: 'Badger' });
    t.is(badgers2.length, 2)
    t.is( badgers2[0].forename, 'Roberto' );
    t.is( badgers2[0].is_admin, 1 );
    t.is( badgers2[1].forename, 'Brian' );
    t.is( badgers2[1].is_admin, 1 );
  }
)

test.serial(
  'update() many records',
  async t => {
    const badgers = await users.update({ is_admin: 1 }, { surname: 'Badger' }).records();
    t.is(badgers.length, 2)
    t.is( badgers[0].forename, 'Roberto' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[0].hello(), 'Hello Roberto Badger' );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[1].is_admin, 1 );
    t.is( badgers[1].hello(), 'Hello Brian Badger' );
  }
)

//-----------------------------------------------------------------------------
// Cleanup
//-----------------------------------------------------------------------------
test.after(
  () => database.destroy()
)