import test from 'ava';
import Record from '../../src/Record.js';
import { database, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'fetchRow({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.fetchRow({ surname: "Badger" }).record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
  }
)

test.serial(
  'selectRow().where({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.selectRow('@basic').where({ surname: "Badger" }).record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.name, 'Bobby Badger' );
  }
)

test.serial(
  'selectRow().where({ surname: "Badger" })...record()',
  async t => {
    const row = users.selectRow('@basic').where({ surname: "Badger" });
    const badger = await row.record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.name, 'Bobby Badger' );
  }
)

test.serial(
  'fetchRow().where({ surname: "Badger" }).record().then()',
  async t => {
    const badger = await users.fetchRow().where({ surname: "Badger" }).record().then( r => r );
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.serial(
  'fetchRow().where({ surname: "Badger" }).then().record()',
  async t => {
    const badger = await users.fetchRow().where({ surname: "Badger" })
      .then( r => r )
      .then( r => r )
      .record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.after(
  () => database.destroy()
)