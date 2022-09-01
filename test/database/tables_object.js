import test from 'ava';
import Tables from '../../src/Tables.js';
import { createDatabase, databaseConfig } from '../library/database.js';
import { Artists, createMusicDb, musicTables } from '../library/music.js'

let fetchedTable = '';

// dummy Tables class which sets fetchTable so we can check
// it's being called
class MyTables extends Tables {
  table(name) {
    fetchedTable = name;
    return this.tables[name];
  }
}

export const mdb = createDatabase({
  ...databaseConfig,
  tablesObject: new MyTables(musicTables),
});

test.before(
  async t => {
    await createMusicDb(mdb);
    t.pass("created music database")
  }
);

test.serial(
  'model.artists',
  t => {
    const artists = mdb.model.artists;
    t.true( artists instanceof Artists );
    t.is( fetchedTable, 'artists' );
  }
)

test.after(
  () => mdb.destroy()
)