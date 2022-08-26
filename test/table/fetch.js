import test from 'ava';
import { database, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

//-----------------------------------------------------------------------------
// fetchAll()
//-----------------------------------------------------------------------------
test.serial(
  'fetchAll()',
  async t => {
    const all = await users.fetchAll();
    t.is( all.length, 3 );
    t.is( all[0].forename, 'Bobby' );
    t.is( all[1].forename, 'Brian' );
    t.is( all[2].forename, 'Simon' );
  }
)

test.serial(
  'fetchAll({ surname: "Badger" })',
  async t => {
    const badgers = await users.fetchAll({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
  }
)

test.serial(
  'fetchAll().where({ surname: "Badger" })',
  async t => {
    const badgers = await users.fetchAll().where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
  }
)

test.serial(
  'fetchAll({ surname: "Mongoose" })',
  async t => {
    const mongeese = await users.fetchAll({ surname: "Mongoose" });
    t.is( mongeese.length, 0 );
  }
)

//-----------------------------------------------------------------------------
// fetchOne()
//-----------------------------------------------------------------------------
test.serial(
  'fetchOne({ surname: "Stoat" })',
  async t => {
    const stoat = await users.fetchOne({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
  }
)

test.serial(
  'fetchOne({ surname: "Badger" })',
  async t => {
    const badger = await users.fetchOne({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.serial(
  'fetchOne({ surname: "Mongoose" })',
  async t => {
    const mongoose = await users.fetchOne({ surname: "Mongoose" });
    t.is( mongoose, undefined );
  }
)


test.after(
  () => database.destroy()
)