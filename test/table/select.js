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
  'select({ where: { surname: "Badger" } })',
  async t => {
    const badger = await users.select({ where: { surname: "Badger" } });
    t.is( badger.forename, 'Bobby' );
    t.is( badger.surname, 'Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.is_admin, undefined );
  }
)

test.serial(
  'select({ columns: "name is_admin", where: { surname: "Badger" } })',
  async t => {
    const badger = await users.select({ columns: "name is_admin", where: { surname: "Badger" } });
    t.is( badger.name, 'Bobby Badger' );
    t.is( badger.email, undefined );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'select({ columns: "@admin", where: { surname: "Badger" } })',
  async t => {
    const badger = await users.select({ columns: "@admin", where: { surname: "Badger" } });
    t.is( badger.name, 'Bobby Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.password, null );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'select("@admin", { surname: "Badger" })',
  async t => {
    const badger = await users.select("@admin", { surname: "Badger" });
    t.is( badger.name, 'Bobby Badger' );
    t.is( badger.email, 'bobby@badger.com' );
    t.is( badger.password, null );
    t.is( badger.is_admin, 1 );
  }
)

test.serial(
  'selectAll("@admin", { surname: "Badger" })',
  async t => {
    const badgers = await users.selectAll("@admin", { surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[1].name, 'Brian Badger' );
    t.is( badgers[1].is_admin, 0 );
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
  'selectOne("@admin", { surname: "Stoat" })',
  async t => {
    const stoat = await users.selectOne("@admin", { surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
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
  'selectOne("@admin").where({ surname: "Stoat" })',
  async t => {
    const stoat = await users.selectOne("@admin").where({ surname: "Stoat" });
    t.is( stoat.forename, 'Simon' );
    t.is( stoat.surname, 'Stoat' );
  }
)

test.serial(
  'selectOne("@admin", { surname: "Badger" })',
  async t => {
    const error = await t.throwsAsync(
      () => users.selectOne("@admin", { surname: "Badger" })
    );
    t.is(error.message, "selectOne for user returned 2 records")
  }
)

test.serial(
  'selectOne("@admin", { surname: "Mongoose" })',
  async t => {
    const error = await t.throwsAsync(
      () => users.selectOne("@admin", { surname: "Mongoose" })
    );
    t.is(error.message, "selectOne for user returned 0 records")
  }
)

test.after(
  () => database.destroy()
)