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
  'insertRows([{ ...Roger Rabbit... }, { ...Richard Rabbit... }])',
  async t => {
    const rabbits = await users.insertRows([
      {
        forename: 'Roger',
        surname: 'Rabbit',
        email: 'roger@rabbit.com'
      },
      {
        forename: 'Richard',
        surname: 'Rabbit',
        email: 'richard@rabbit.com'
      },
    ]);
    t.is( rabbits.length, 2 );
    t.is( rabbits[0].forename, 'Roger' );
    t.is( rabbits[1].forename, 'Richard' );
  }
)

test.serial(
  'insertRows({ [...David Dormous...], [...Derek Dormouse...] }).then()',
  async t => {
    const dormice = await users.insertRows([
      {
        forename: 'David',
        surname: 'Dormouse',
        email: 'david@dormouse.com'
      },
      {
        forename: 'Derek',
        surname: 'Dormouse',
        email: 'derek@dormouse.com'
      },
    ]).then(
      rows => rows
    );
    t.is( dormice.length, 2 );
    // t.true( dormice[0] instanceof User )
    // t.true( dormice[1] instanceof User )
    t.is( dormice[0].forename, 'David' );
    t.is( dormice[1].forename, 'Derek' );
  }
)


test.after(
  () => database.destroy()
)