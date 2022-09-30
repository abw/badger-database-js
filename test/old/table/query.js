import test from 'ava';
import { musicdb, createMusicDb } from '../library/music.js'

const albums = musicdb.model.albums;

test.before(
  async t => {
    await createMusicDb();
    t.pass("created music database")
  }
);

test.serial(
  'raw SQL query',
  async t => {
    const albumList = await albums.query('SELECT * FROM albums WHERE id=2');
    t.is( albumList.length, 1 );
    t.is( albumList[0].title, 'Wish You Were Here' );
  }
)

test.serial(
  'selectByNumberOfTracks',
  async t => {
    const albumList = await albums.query('selectByNumberOfTracks');
    t.is( albumList.length, 4 );
    t.is( albumList[0].title, 'Wish You Were Here' );
    t.is( albumList[0].n_tracks, 4 );
    t.is( albumList[1].title, 'Foxtrot' );
    t.is( albumList[1].n_tracks, 6 );
    t.is( albumList[2].title, 'Selling England by the Pound' );
    t.is( albumList[2].n_tracks, 7 );
    t.is( albumList[3].title, 'The Dark Side of the Moon' );
    t.is( albumList[3].n_tracks, 9 );
  }
)

test.serial(
  'titleByYear',
  async t => {
    const albumList = await albums.query('titleByYear');
    t.is( albumList.length, 4 );
    t.is( albumList[0].titleYear, 'Foxtrot (1972)' );
    t.is( albumList[1].titleYear, 'The Dark Side of the Moon (1973)' );
    t.is( albumList[2].titleYear, 'Selling England by the Pound (1973)' );
    t.is( albumList[3].titleYear, 'Wish You Were Here (1975)');
  }
)

test.serial(
  'SQL with embedded fragments',
  async t => {
    const albumList = await albums.query('SELECT <columns> FROM <table> ORDER BY year,id');
    t.is( albumList.length, 4 );
    t.is( albumList[0].title, 'Foxtrot' );
    t.is( albumList[1].title, 'The Dark Side of the Moon' );
    t.is( albumList[2].title, 'Selling England by the Pound' );
    t.is( albumList[3].title, 'Wish You Were Here');
  }
)

test.after(
  () => musicdb.destroy()
)