import test from 'ava';
import { connect, createUsers } from '../library/users.js'

const users = database.table('users');

test.before(
  async t => {
    await createUsers(database);
    t.pass("created users table")
  }
);

test.serial(
  'selectRows()',
  async t => {
    const badgers = await users.selectRows();
    t.is( badgers.length, 3 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[2].forename, 'Simon' );
  }
)

test.serial(
  'selectRows("name")',
  async t => {
    const badgers = await users.selectRows("name");
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
  'selectRows("@admin")',
  async t => {
    const badgers = await users.selectRows("@admin");
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
  'selectRows().where({ surname: "Badger" })',
  async t => {
    const badgers = await users.selectRows().where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].forename, 'Bobby' );
    t.is( badgers[0].surname, 'Badger' );
    t.is( badgers[1].forename, 'Brian' );
    t.is( badgers[1].surname, 'Badger' );
  }
)

test.serial(
  'selectRows("@admin").where({ surname: "Badger" })',
  async t => {
    const badgers = await users.selectRows("@admin").where({ surname: "Badger" });
    t.is( badgers.length, 2 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].is_admin, 1 );
    t.is( badgers[1].name, 'Brian Badger' );
    t.is( badgers[1].is_admin, 0 );
  }
)

test.serial(
  'selectRows("@admin").where({ surname: "Badger" }).limit(1)',
  async t => {
    const badgers = await users.selectRows("@admin").where({ surname: "Badger" }).limit(1);
    t.is( badgers.length, 1 );
    t.is( badgers[0].name, 'Bobby Badger' );
    t.is( badgers[0].is_admin, 1 );
  }
)

test.serial(
  'selectRows("@admin").where({ surname: "Stoat" })',
  async t => {
    const stoats = await users.selectRows("@admin").where({ surname: "Stoat" });
    t.is( stoats.length, 1 );
    t.is( stoats[0].name, 'Simon Stoat' );
    t.is( stoats[0].is_admin, null );
  }
)

test.after(
  () => database.destroy()
)