import test from 'ava';
import { musicdb, createMusicDb, Artists, Albums, Tracks } from '../library/music.js'

test.before(
  async t => {
    await createMusicDb();
    t.pass("created music database")
  }
);

test.serial(
  'model.artists',
  t => {
    const artists = musicdb.model.artists;
    t.true( artists instanceof Artists );
  }
)

test.serial(
  'model.albums',
  t => {
    const model = musicdb.model;
    const albums = model.albums;
    t.true( albums instanceof Albums );
  }
)

test.serial(
  'model.table("tracks")',
  t => {
    const model = musicdb.model;
    const tracks = model.table('tracks');
    t.true( tracks instanceof Tracks );
  }
)

test.serial(
  'model.missing_table',
  t => {
    const error = t.throws(
      () => {
        // eslint-disable-next-line no-unused-vars
        const missing = musicdb.model.missing_table;
      }
    )
    t.is( error.message, "Invalid table specified: missing_table" );
  }
)

test.after(
  () => musicdb.destroy()
)