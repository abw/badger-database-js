import test from 'ava';
import { Albums, Artists, connectMusicDatabase, Tracks } from '../library/music_database.js';

let musicdb;

test.before(
  async t => {
    musicdb = await connectMusicDatabase();
    t.pass("connected to music database")
  }
);

test.serial(
  'model.artists',
  async t => {
    const artists = await musicdb.model.artists;
    t.true( artists instanceof Artists );
  }
)

test.serial(
  'model.albums',
  async t => {
    const model = musicdb.model;
    const albums = await model.albums;
    t.true( albums instanceof Albums );
  }
)

test.serial(
  'model.table("tracks")',
  async t => {
    const model = musicdb.model;
    const tracks = await model.table('tracks');
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
  () => musicdb.disconnect()
)