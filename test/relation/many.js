import test from 'ava';
import { musicdb, createMusicDb, Album, Track } from '../library/music.js'

const albums  = musicdb.table('albums');

test.before(
  async t => {
    await createMusicDb();
    t.pass("created music database")
  }
);

test.serial(
  'DSOTM.relation("tracks")',
  async t => {
    const dsotm = await albums.fetchOne({ title: 'The Dark Side of the Moon' }).record();
    t.true( dsotm instanceof Album )
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    const tracks = await dsotm.relation('tracks');
    t.is( tracks.length, 9 )
    t.true( tracks[0] instanceof Track )
    t.is( tracks[0].title, 'Speak to Me / Breathe' );
    t.true( tracks[8] instanceof Track )
    t.is( tracks[8].title, 'Eclipse' );
  }
)

test.serial(
  'DSOTM.tracks',
  async t => {
    const dsotm = await albums.fetchOne({ title: 'The Dark Side of the Moon' }).record();
    t.true( dsotm instanceof Album )
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    const tracks = await dsotm.tracks;
    t.is( tracks.length, 9 )
    t.true( tracks[0] instanceof Track )
    t.is( tracks[0].title, 'Speak to Me / Breathe' );
    t.true( tracks[8] instanceof Track )
    t.is( tracks[8].title, 'Eclipse' );
  }
)

test.after(
  () => musicdb.destroy()
)