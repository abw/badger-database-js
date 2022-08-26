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
  'fetch({ surname: "Badger" }).record()',
  async t => {
    const badger = await users.select('@basic').where({ surname: "Badger" }).record();
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.name, 'Bobby Badger' );
    t.is( badger.hello(), 'hello world' );
    badger.sayHello();
  }
)

test.serial(
  'fetch({ surname: "Badger" }).record().then()',
  async t => {
    const badger = await users.select('@basic').where({ surname: "Badger" }).record().then( r => r );
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.name, 'Bobby Badger' );
    t.is( badger.hello(), 'hello world' );
  }
)

test.serial(
  'fetchAll().records()',
  async t => {
    const all = await users.fetchAll().records();
    console.log('all: ', all);
    console.log('first result: ', all[0]);
    t.is( all.length, 3 );
  }
)
