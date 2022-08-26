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
// selectAll()
//-----------------------------------------------------------------------------
test.serial(
  'selectAll()',
  async t => {
    const badgers = await users.selectAll();
    t.is( badgers.length, 3 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[2].forename, 'Simon' );
  }
)

test.serial(
  'selectAll("name")',
  async t => {
    const badgers = await users.selectAll("name");
    t.is( badgers.length, 3 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].forename, undefined );
    t.is( badgers[1].name, 'Brian Badger' );
    t.is( badgers[1].forename, undefined );
    t.is( badgers[2].name, 'Simon Stoat' );
    t.is( badgers[2].forename, undefined );
  }
)

test.serial(
  'selectAll("@admin")',
  async t => {
    const badgers = await users.selectAll("@admin");
    t.is( badgers.length, 3 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[1].name, 'Brian Badger' );
    t.is( badgers[1].is_admin, 0 );
    t.is( badgers[2].name, 'Simon Stoat' );
    t.is( badgers[2].is_admin, null );
  }
)

test.serial(
  'selectAll().where({ surname: "Badger" })',
  async t => {
    const badgers = await users.selectAll().where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[0].surname, 'Badger' );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[1].surname, 'Badger' );
  }
)

test.serial(
  'selectAll("@admin").where({ surname: "Badger" })',
  async t => {
    const badgers = await users.selectAll("@admin").where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[1].name, 'Brian Badger' );
    t.is( badgers[1].is_admin, 0 );
  }
)

test.serial(
  'selectAll("@admin").where({ surname: "Stoat" })',
  async t => {
    const stoats = await users.selectAll("@admin").where({ surname: "Stoat" });
    t.is( stoats.length, 1 );
    t.is( stoats[0].name, 'Simon Stoat' );
    t.is( stoats[0].is_admin, null );
  }
)

//-----------------------------------------------------------------------------
// selectOne()
//-----------------------------------------------------------------------------
test.serial(
  'selectOne()',
  async t => {
    const badger = await users.selectOne();
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badger.com' );
  }
)

test.serial(
  'selectOne().where({ surname: "Stoat" })',
  async t => {
    const stoat = await users.selectOne().where({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
    t.is( stoat.email, 'simon@stoat.com' );
  }
)

test.serial(
  'selectOne().where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectOne().where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.is_admin, undefined );
  }
)

test.serial(
  'selectOne("@admin").where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectOne("@admin").where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'selectOne("...admin").where({ surname: "Badger" } })',
  async t => {
    const badger = await users.selectOne("...admin").where({ surname: "Badger" });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'selectOne("@admin").where({ surname: "Stoat" })',
  async t => {
    const stoat = await users.selectOne("@admin").where({ surname: "Stoat" });
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