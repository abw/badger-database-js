import test from 'ava';
import { musicdb, createMusicDb } from '../library/music.js'

test.before(
  async t => {
    await createMusicDb();
    t.pass("created music database")
  }
);

test.serial(
  'raw SQL query',
  async t => {
    const albums = await musicdb.query('SELECT * FROM albums WHERE id=2');
    t.is( albums.length, 1 );
    t.is( albums[0].title, 'Wish You Were Here' );
  }
)

test.serial(
  'named query albumWithMostTracks',
  async t => {
    const albums = await musicdb.query('albumWithMostTracks');
    t.is( albums.length, 1 );
    t.is( albums[0].title, 'The Dark Side of the Moon' );
  }
)

test.serial(
  'named query albumsByNumberOfTracks',
  async t => {
    const albums = await musicdb.query('albumsByNumberOfTracks');
    t.is( albums.length, 4 );
    t.is( albums[0].title, 'Wish You Were Here' );
    t.is( albums[0].n_tracks, 4 );
    t.is( albums[1].title, 'Foxtrot' );
    t.is( albums[1].n_tracks, 6 );
    t.is( albums[2].title, 'Selling England by the Pound' );
    t.is( albums[2].n_tracks, 7 );
    t.is( albums[3].title, 'The Dark Side of the Moon' );
    t.is( albums[3].n_tracks, 9 );
  }
)

test.serial(
  'named query theBestAlbumEverRecorded',
  async t => {
    const albums = await musicdb.query('theBestAlbumEverRecorded');
    t.is( albums.length, 1 );
    t.is( albums[0].title, 'The Dark Side of the Moon' );
  }
)

test.after(
  () => musicdb.destroy()
)