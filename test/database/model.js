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

test.after(
  () => musicdb.destroy()
)