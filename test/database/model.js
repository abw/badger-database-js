import test from 'ava';
import { Albums, Artists, connectMusicDatabase } from '../library/music_database.js';

let musicdb;

test.before( 'connect',
  async t => {
    musicdb = await connectMusicDatabase();
    t.pass("connected to music database")
  }
);

test.serial( 'model.artists',
  async t => {
    const artists = await musicdb.model.artists;
    t.true( artists instanceof Artists );
  }
)

test.serial( 'model.albums',
  async t => {
    const model = musicdb.model;
    const albums = await model.albums;
    t.true( albums instanceof Albums );
  }
)

/*
test.serial( 'model.table("tracks")',
  async t => {
    const model = musicdb.model;
    const tracks = await model.table('tracks');
    t.true( tracks instanceof Tracks );
  }
)
*/

test.serial( 'model.missing_table',
  async t => {
    const error = await t.throwsAsync(
      () => musicdb.model.missing_table
    )
    t.is( error.message, "Invalid table specified: missing_table" );
  }
)

test.after( 'disconnect',
  () => musicdb.disconnect()
)