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
  'insert({ ...Frank Ferret... })',
  async t => {
    const ferret = await users.insert({
      forename: 'Frank',
      surname: 'Ferret',
      email: 'frank@ferret.com'
    });
    t.is(ferret.forename, 'Frank');
    t.is(ferret.surname, 'Ferret');
    t.is(ferret.id, 4);
  }
)

test.serial(
  'insert([{ ...Roger Rabbit... }, { ...Richard Rabbit... }])',
  async t => {
    const rabbits = await users.insert([
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

test.after(
  () => database.destroy()
)