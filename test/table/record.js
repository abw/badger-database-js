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
  'fetchOne({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.fetchOne({ surname: "Badger" }).record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby', 'badger forename is Bobby' );
    t.is( badger.surname, 'Badger', 'badger surname is Badger' );
    t.is( badger.name, undefined, 'badger name is undefined' );
  }
)

test.serial(
  'selectOne().where({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.selectOne('@basic').where({ surname: "Badger" }).record();
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.name, 'Bobby Badger' );
  }
)

test.serial(
  'fetchOne().where({ surname: "Badger" }).record().then()',
  async t => {
    const badger = await users.fetchOne().where({ surname: "Badger" }).record().then( r => r );
    t.true( badger instanceof Record, 'badger is a Record');
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
  }
)

test.after(
  () => database.destroy()
)