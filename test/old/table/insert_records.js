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
  'insertRows({ [...Edward Elephant...], [...Eric Elephant...] }).records()',
  async t => {
    const elephants = await users.insertRows([
      {
        forename: 'Edward',
        surname: 'Elephant',
        email: 'edward@elephant.com'
      },
      {
        forename: 'Eric',
        surname: 'Elephant',
        email: 'eric@elephant.com'
      },
    ]).records();
    t.is( elephants.length, 2 );
    t.true( elephants[0] instanceof User )
    t.true( elephants[1] instanceof User )
    t.is( elephants[0].forename, 'Edward' );
    t.is( elephants[1].forename, 'Eric' );
  }
)

test.serial(
  'insertRows({ [...Harry Horse...], [...Hector Horse...] }).then.().records()',
  async t => {
    const horses = await users.insertRows([
      {
        forename: 'Harry',
        surname: 'Horse',
        email: 'harry@horse.com'
      },
      {
        forename: 'Hector',
        surname: 'Horse',
        email: 'hector@horse.com'
      },
    ]).then( rows => rows ).records();
    t.is( horses.length, 2 );
    t.true( horses[0] instanceof User )
    t.true( horses[1] instanceof User )
    t.is( horses[0].forename, 'Harry' );
    t.is( horses[1].forename, 'Hector' );
  }
)

test.after(
  () => database.destroy()
)