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

//-----------------------------------------------------------------------------
// insertRow()
//-----------------------------------------------------------------------------
test.serial(
  'insert({ ...Frank Ferret... })',
  async t => {
    const ferret = await users.insertRow({
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
  'insert({ ...Gerald Gerbil... }).record()',
  async t => {
    const gerbil = await users.insertRow({
      forename: 'Gerald',
      surname: 'Gerbil',
      email: 'gerald@gerbil.com'
    }).record();
    // console.log('record: ', gerbil);
    t.true(gerbil instanceof User);
    t.is(gerbil.forename, 'Gerald');
    t.is(gerbil.surname, 'Gerbil');
    t.is(gerbil.id, 5);
    t.is(gerbil.hello(),'Hello Gerald Gerbil');
  }
)

/*

test.serial(
  'insert({ ...Gerald Gerbil... }).record()',
  async t => {
    const g1 = await users.insertRow({
      forename: 'Gerald',
      surname: 'Gerbil',
      email: 'gerald@gerbil.com'
    })
    const gerbil = await users.fetchOne({ id: g1.id }).record();
    console.log('record: ', gerbil);
    t.true(gerbil instanceof User);
    t.is(gerbil.forename, 'Gerald');
    t.is(gerbil.surname, 'Gerbil');
    t.is(gerbil.id, 5);
    t.is(gerbil.hello(),'Hello Gerald Gerbil');
  }
)

/*
test.serial(
  'insert({ ...Gerald Gerbil... }).record()',
  async t => {
    const gerbil = await users.insertRow({
      forename: 'Gerald',
      surname: 'Gerbil',
      email: 'gerald@gerbil.com'
    }).record();
    console.log('record: ', gerbil);

    t.true(gerbil instanceof User);
    t.is(gerbil.forename, 'Gerald');
    t.is(gerbil.surname, 'Gerbil');
    t.is(gerbil.id, 5);
    t.is(gerbil.hello(),'Hello Gerald Gerbil');
  }
)

test.serial(
  'insert({ ...Roger Rabbit, Richard Rabbit... })',
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
    // darn - MySQL and sqlite only return the last ID
    t.is(rabbits.length, 1);
    t.is(rabbits[0], 6);
  }
)
*/
test.after(
  () => database.destroy()
)