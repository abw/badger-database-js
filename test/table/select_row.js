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
  'selectRow()',
  async t => {
    const badger = await users.selectRow();
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badgerpower.com' );
  }
)

test.serial(
  'selectRow().where({ surname: "Stoat" })',
  async t => {
    const stoat = await users.selectRow().where({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
    t.is( stoat.email, 'simon@stoat.com' );
  }
)

test.serial(
  'selectRow().where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectRow().where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badgerpower.com' );
    t.is( badger.is_admin, undefined );
  }
)

test.serial(
  'selectRow("@admin").where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectRow("@admin").where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badgerpower.com' );
    t.is( badger.email, 'bobby@badgerpower.com' );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'selectRow("...admin").where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectRow("...admin").where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badgerpower.com' );
    t.is( badger.email, 'bobby@badgerpower.com' );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'selectRow("@admin").where({ surname: "Stoat" })',
  async t => {
    const stoat = await users.selectRow("@admin").where({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
    t.is( stoat.email, 'simon@stoat.com' );
    t.is( stoat.name, 'Simon Stoat' );
  }
)

//-----------------------------------------------------------------------------
// Cleanup
//-----------------------------------------------------------------------------
test.after(
  () => database.destroy()
)