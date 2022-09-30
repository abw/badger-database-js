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
    t.true(gerbil instanceof User);
    t.is(gerbil.forename, 'Gerald');
    t.is(gerbil.surname, 'Gerbil');
    t.is(gerbil.id, 5);
    t.is(gerbil.hello(),'Hello Gerald Gerbil');
  }
)


test.serial(
  'insert({ ...Harry Horse Gerbil... }).then().record()',
  async t => {
    const harry = await users.insertRow({
      forename: 'Harry',
      surname: 'Horse',
      email: 'harry@horse.com'
    }).then( r => r ).record();
    t.true(harry instanceof User);
    t.is(harry.forename, 'Harry');
    t.is(harry.surname, 'Horse');
    t.is(harry.hello(),'Hello Harry Horse');
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

*/
test.after(
  () => database.destroy()
)