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
  'fetchAll().records()',
  async t => {
    const all = await users.fetchAll().records();
    t.is( all.length, 3 );
    t.true( all[0] instanceof Record, 'badgers[0] is a Record');
    t.true( all[1] instanceof Record, 'badgers[1] is a Record');
    t.true( all[2] instanceof Record, 'badgers[2] is a Record');
  }
)

test.serial(
  'fetchAll({ surname: "Badger" }).records()',
  async t => {
    const badgers = await users.fetchAll({ surname: "Badger" }).records();
    t.true( badgers[0] instanceof Record, 'badgers[0] is a Record');
    t.is( badgers[0].forename, 'Bobby', 'badgers[0] forename is Bobby' );
    t.is( badgers[0].surname, 'Badger', 'badgers[0] surname is Badger' );
    t.is( badgers[0].name, undefined, 'badgers[0] name is undefined' );
    t.true( badgers[1] instanceof Record, 'badgers[1] is a Record');
    t.is( badgers[1].forename, 'Brian', 'badgers[1] forename is Brian' );
    t.is( badgers[1].surname, 'Badger', 'badgers[1] surname is Badger' );
    t.is( badgers[1].name, undefined, 'badgers[1] name is undefined' );
  }
)

test.serial(
  'selectAll("@admin").where({ surname: "Badger" }).records()',
  async t => {
    const badgers = await users.selectAll('@admin').where({ surname: "Badger" }).records();
    t.true( badgers[0] instanceof Record, 'badgers[0] is a Record');
    t.is( badgers[0].forename, 'Bobby', 'badgers[0] forename is Bobby' );
    t.is( badgers[0].surname, 'Badger', 'badgers[0] surname is Badger' );
    t.is( badgers[0].name, 'Bobby Badger', 'badgers[0] name is Bobby Badger' );
    t.is( badgers[0].is_admin, 1, 'badgers[0] is_admin is 1' );
    t.true( badgers[1] instanceof Record, 'badgers[1] is a Record');
    t.is( badgers[1].forename, 'Brian', 'badgers[1] forename is Brian' );
    t.is( badgers[1].surname, 'Badger', 'badgers[1] surname is Badger' );
    t.is( badgers[1].name, 'Brian Badger', 'badgers[0] name is Brian Badger' );
    t.is( badgers[1].is_admin, 0, 'badgers[1] is_admin is 0' );
  }
)

test.after(
  () => database.destroy()
)