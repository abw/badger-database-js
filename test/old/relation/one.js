import test from 'ava';
import { musicdb, createMusicDb, Artist, Album } from '../library/music.js'

//const artists = musicdb.table('artists');
const albums  = musicdb.table('albums');
//const tracks  = musicdb.table('tracks');

test.before(
  async t => {
    await createMusicDb();
    t.pass("created music database")
  }
);

test.serial(
  'DSOTM.relation("artist")',
  async t => {
    const dsotm = await albums.fetchRow({ title: 'The Dark Side of the Moon' }).record();
    t.true( dsotm instanceof Album )
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    const floyd = await dsotm.relation('artist');
    t.true( floyd instanceof Artist )
    t.is( floyd.name, 'Pink Floyd' );
  }
)

test.serial(
  'DSOTM.artist',
  async t => {
    const dsotm = await albums.fetchRow({ title: 'The Dark Side of the Moon' }).record();
    t.true( dsotm instanceof Album )
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    const floyd = await dsotm.artist;
    t.true( floyd instanceof Artist )
    t.is( floyd.name, 'Pink Floyd' );
  }
)

test.after(
  () => musicdb.destroy()
)