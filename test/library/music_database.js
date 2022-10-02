import test from 'ava';
import Record from "../../src/Record.js";
import Table from "../../src/Table.js";
import { connect } from "../../src/Database.js";

export class Artists extends Table {
}

export class Albums extends Table {
}

export class Tracks extends Table {
}

export class Artist extends Record {
}

export class Album extends Record {
}

export class Track extends Record {
}

export async function connectMusicDatabase(database, options={}) {
  const sqlite  = options.sqlite  || false;
  const mysql   = options.mysql   || false;
  const serial  = options.serial  || sqlite ? 'INTEGER PRIMARY KEY ASC' : 'SERIAL';
  const reftype = options.reftype || mysql ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER';

  const fragments = {
    selectAlbumsWithTrackCount: `
      SELECT    albums.title,
                COUNT(tracks.id) as n_tracks
      FROM      albums
      JOIN      tracks
      ON        tracks.album_id=albums.id
      GROUP BY  albums.id`
  };

  const queries = {
    dropArtistsTable: 'DROP TABLE IF EXISTS artists',
    dropAlbumsTable:  'DROP TABLE IF EXISTS albums',
    dropTracksTable:  'DROP TABLE IF EXISTS tracks',
    createArtistsTable: `
      CREATE TABLE artists (
        id        ${serial},
        name      TEXT
        ${sqlite ? '' : ', PRIMARY KEY (id)'}
    )`,
    createAlbumsTable: `
      CREATE TABLE albums (
        id        ${serial},
        year      INTEGER,
        title     TEXT,
        artist_id ${reftype},
        ${sqlite ? '' : 'PRIMARY KEY (id),'}
        FOREIGN KEY (artist_id) REFERENCES artists(id)
      )`,
    createTracksTable: `
      CREATE TABLE tracks (
        id        ${serial},
        title     TEXT,
        album_id  ${reftype},
        ${sqlite ? '' : 'PRIMARY KEY (id),'}
        FOREIGN KEY (album_id) REFERENCES albums(id)
      )`,
    albumsByNumberOfTracks: `
      <selectAlbumsWithTrackCount>
      ORDER BY  n_tracks`,
    albumWithMostTracks: `
      <selectAlbumsWithTrackCount>
      ORDER BY  n_tracks DESC
      LIMIT     1`,
    theBestAlbumEverRecorded: `
      SELECT    *
      FROM      albums
      WHERE     title="The Dark Side of the Moon"`
  };

  const albumsFragments = {
    title_year:  sqlite
      ? "(title || ' (' || year || ')') as title_year"
      : "CONCAT(title, ' (', year, ')') as title_year",
    selectTitleAndTrackCount:`
      SELECT    albums.title,
                COUNT(tracks.id) as n_tracks
      FROM      albums
      JOIN      tracks
      ON        tracks.album_id=albums.id
      GROUP BY  albums.id`
  };

  const albumsQueries = {
    selectByNumberOfTracks:`
      <selectTitleAndTrackCount>
      ORDER BY  n_tracks`,
    titleByYear:`
      SELECT    <title_year>
      FROM      <table>
      ORDER BY  year
    `
  };

  const artists = {
    columns:      'id name',
    tableClass:   Artists,
    recordClass:  Artist
  };

  const albums = {
    columns:        'id title year artist_id',
    tableClass:     Albums,
    recordClass:    Album,
    fragments:      albumsFragments,
    queries:        albumsQueries,
    relations: {
      artist: {
        type:       'one',
        table:      'artists',
        localKey:   'artist_id',
        remoteKey:  'id',
      },
      tracks: {
        type:       'many',
        table:      'tracks',
        localKey:   'id',
        remoteKey:  'album_id',
      }
    }
  };

  const tracks = {
    columns:      'id title album_id',
    tableClass:   Tracks,
    recordClass:  Track
  };

  const tables = {
    artists, albums, tracks
  };

  const musicdb = await connect({
    database, tables, fragments, queries
  });

  return musicdb;
}

export const runMusicDatabaseTests = async (database, options) => {
  const musicdb = await connectMusicDatabase(database, options);
  const artists = await musicdb.table('artists');
  const albums  = await musicdb.table('albums');
  const tracks  = await musicdb.table('tracks');
  let PinkFloyd, Genesis;
  let DSOTM, WYWH;
  let Foxtrot, Selling;

  test.serial(
    'drop existing tables',
    async t => {
      await musicdb.run('dropTracksTable');
      await musicdb.run('dropAlbumsTable');
      await musicdb.run('dropArtistsTable');
      t.pass();
    }
  )

  test.serial(
    'create artists',
    async t => {
      await musicdb.run('createArtistsTable');
      t.pass();
    }
  )

  test.serial(
    'create albums',
    async t => {
      await musicdb.run('createAlbumsTable');
      t.pass();
    }
  )

  test.serial(
    'create tracks',
    async t => {
      await musicdb.run('createTracksTable');
      t.pass();
    }
  )

  test.serial(
    'insert artists',
    async t => {
      [PinkFloyd, Genesis] = await artists.insert(
        [
          { name: 'Pink Floyd' },
          { name: 'Genesis' },
        ],
        { reload: true }
      )
      t.is(PinkFloyd.id, 1);
      t.is(PinkFloyd.name, 'Pink Floyd');
      t.is(Genesis.id, 2);
      t.is(Genesis.name, 'Genesis');
    }
  )

  test.serial(
    'insert Pink Floyd albums',
    async t => {
      [DSOTM, WYWH] = await albums.insert(
        [
          { artist_id: PinkFloyd.id, year: 1973, title: 'The Dark Side of the Moon' },
          { artist_id: PinkFloyd.id, year: 1975, title: 'Wish You Were Here' },
        ],
        { reload: true }
      );
      t.is(DSOTM.id, 1);
      t.is(DSOTM.year, 1973);
      t.is(WYWH.id, 2);
      t.is(WYWH.year, 1975);
    }
  )

  test.serial(
    'insert Genesis albums',
    async t => {
      [Foxtrot, Selling] = await albums.insert(
        [
          { artist_id: Genesis.id, year: 1972, title: 'Foxtrot', },
          { artist_id: Genesis.id, year: 1973, title: 'Selling England by the Pound', },
        ],
        { reload: true }
      );
      t.is(Foxtrot.id, 3);
      t.is(Foxtrot.year, 1972);
      t.is(Selling.id, 4);
      t.is(Selling.year, 1973);
    }
  )

  test.serial(
    'insert tracks',
    async t => {
      await tracks.insert([
        // The Dark Side of the Moon
        { album_id: DSOTM.id,    title: 'Speak to Me / Breathe' },
        { album_id: DSOTM.id,    title: 'On the Run' },
        { album_id: DSOTM.id,    title: 'Time' },
        { album_id: DSOTM.id,    title: 'The Great Gig in the Sky' },
        { album_id: DSOTM.id,    title: 'Money' },
        { album_id: DSOTM.id,    title: 'Us and Them' },
        { album_id: DSOTM.id,    title: 'Any Colour You Like' },
        { album_id: DSOTM.id,    title: 'Brain Damage' },
        { album_id: DSOTM.id,    title: 'Eclipse' },
        // Wish You Were Here
        { album_id: WYWH.id,     title: 'Shine On You Crazy Diamond (Parts I-V)' },
        { album_id: WYWH.id,     title: 'Welcome to the Machine' },
        { album_id: WYWH.id,     title: 'Have a Cigar' },
        { album_id: WYWH.id,     title: 'Shine On You Crazy Diamond (Parts VI-IX)' },
        // Foxtrot
        { album_id: Foxtrot.id,  title: 'Watcher of the Skies' },
        { album_id: Foxtrot.id,  title: 'Time Table' },
        { album_id: Foxtrot.id,  title: "Get 'em Out by Friday" },
        { album_id: Foxtrot.id,  title: 'Can-Utility and the Coastliners' },
        { album_id: Foxtrot.id,  title: 'Horizons' },
        { album_id: Foxtrot.id,  title: 'Dancing with the Moonlit Knight' },
        // Selling England by the Pound
        { album_id: Selling.id,  title: 'I Know What I Like (In Your Wardrobe)' },
        { album_id: Selling.id,  title: 'Firth of Fifth' },
        { album_id: Selling.id,  title: 'More Fool Me' },
        { album_id: Selling.id,  title: 'The Battle of Epping Forest' },
        { album_id: Selling.id,  title: 'After the Ordeal' },
        { album_id: Selling.id,  title: 'The Cinema Show' },
        { album_id: Selling.id,  title: 'Aisle of Plenty' },
      ]);
      t.pass();
    }
  )

  test.serial(
    'raw SQL query',
    async t => {
      const albumList = await albums.all('SELECT * FROM albums WHERE id=2');
      t.is( albumList.length, 1 );
      t.is( albumList[0].title, 'Wish You Were Here' );
    }
  )

  test.serial(
    'selectByNumberOfTracks',
    async t => {
      const albumList = await albums.all('selectByNumberOfTracks');
      t.is( albumList.length, 4 );
      t.is( albumList[0].title, 'Wish You Were Here' );
      t.is( parseInt(albumList[0].n_tracks), 4 );
      t.is( albumList[1].title, 'Foxtrot' );
      t.is( parseInt(albumList[1].n_tracks), 6 );
      t.is( albumList[2].title, 'Selling England by the Pound' );
      t.is( parseInt(albumList[2].n_tracks), 7 );
      t.is( albumList[3].title, 'The Dark Side of the Moon' );
      t.is( parseInt(albumList[3].n_tracks), 9 );
    }
  )

  test.serial(
    'titleByYear',
    async t => {
      const albumList = await albums.all('titleByYear');
      t.is( albumList.length, 4 );
      t.is( albumList[0].title_year, 'Foxtrot (1972)' );
      t.is( albumList[1].title_year, 'The Dark Side of the Moon (1973)' );
      t.is( albumList[2].title_year, 'Selling England by the Pound (1973)' );
      t.is( albumList[3].title_year, 'Wish You Were Here (1975)');
    }
  )

  test.serial(
    'SQL with embedded fragments',
    async t => {
      const albumList = await albums.all('SELECT <columns> FROM <table> ORDER BY year,id');
      t.is( albumList.length, 4 );
      t.is( albumList[0].title, 'Foxtrot' );
      t.is( albumList[1].title, 'The Dark Side of the Moon' );
      t.is( albumList[2].title, 'Selling England by the Pound' );
      t.is( albumList[3].title, 'Wish You Were Here');
    }
  )

  return musicdb;
}

