import test from 'ava';
import Record from "../../src/Record.js";
import Table from "../../src/Table.js";
import { connect } from "../../src/Database.js";
import { databaseConfig } from './database.js';
import { setDebug } from '../../src/Utils/Debug.js';
import { remove } from '@abw/badger-utils';

//-----------------------------------------------------------------------------
// debugging
//-----------------------------------------------------------------------------
const debugArtists = false;
const debugAlbums  = false;
const debugTracks  = false;
setDebug({
  record: false,
})

//-----------------------------------------------------------------------------
// Table and Record classes
//-----------------------------------------------------------------------------
export class Artists extends Table {
}

export class Albums extends Table {
}

export class Tracks extends Table {
}

export class Artist extends Record {
  async addAlbum(config) {
    const albums = await this.database.table('albums');
    const tracks = remove(config, 'tracks');
    const album  = await albums.insertRecord({
      ...config, artist_id: this.row.id
    })
    if (tracks) {
      await album.insertTracks(tracks);
    }
    return album;
  }
}

export class Album extends Record {
  async insertTracks(tracks) {
    const table = await this.database.table('tracks');
    let track_no = 1;
    await table.insert(
      tracks.map(
        track => ({ album_id: this.row.id, track_no: track_no++, ...track,  })
      )
    );
  }
}

export class Track extends Record {
}

//-----------------------------------------------------------------------------
// Connect to database and setup tables
//-----------------------------------------------------------------------------
export async function connectMusicDatabase(engine='sqlite') {
  const database = databaseConfig(engine);
  const sqlite   = engine === 'sqlite';
  const mysql    = engine === 'mysql';
  const postgres = engine === 'postgres';
  const serial   = sqlite ? 'INTEGER PRIMARY KEY ASC' : 'SERIAL';
  const reftype  = mysql ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER';

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
        track_no  INTEGER,
        bonus     BOOLEAN DEFAULT false,
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
      WHERE     title='The Dark Side of the Moon'`
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
      AND       tracks.bonus=false
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
    recordClass:  Artist,
    debug:        debugArtists,
    queries: {
      album_tracks: `
        SELECT    tracks.*, albums.title as album, albums.year
        FROM      albums
        JOIN      tracks
        ON        tracks.album_id=albums.id
        WHERE     albums.artist_id=${postgres ? '$1' : '?'}
        ORDER BY  albums.year,tracks.track_no
      `
    },
    relations: {
      albums: {
        relation: 'id => albums.artist_id',
        order: 'year'
      },
      album_tracks: {
        type: 'many',
        load: async (record) => {
          const artists = record.table;
          const rows = await artists.all(
            'album_tracks',
            [record.row.id]
          )
          return artists.records(rows);
        }
      }
    }
  };

  const albums = {
    columns:        'id title year artist_id',
    tableClass:     Albums,
    recordClass:    Album,
    debug:          debugAlbums,
    fragments:      albumsFragments,
    queries:        albumsQueries,
    relations: {
      artist: 'artist_id -> artists.id',
      tracks: {
        type:       'many',
        table:      'tracks',
        localKey:   'id',
        remoteKey:  'album_id',
        orderBy:    'track_no',
        where:      { bonus: 0 }
      },
      bonus_tracks: {
        type:       'many',
        table:      'tracks',
        localKey:   'id',
        remoteKey:  'album_id',
        orderBy:    'track_no',
        where:      { bonus: 1 }
      }
    }
  };

  const tracks = {
    columns:      'id title album_id track_no bonus',
    tableClass:   Tracks,
    recordClass:  Track,
    debug:        debugTracks,
  };

  const tables = {
    artists, albums, tracks
  };

  const musicdb = await connect({
    database, tables, fragments, queries
  });

  return musicdb;
}

//-----------------------------------------------------------------------------
// Run numerous tests
//-----------------------------------------------------------------------------
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
        { album_id: DSOTM.id,    track_no: 1, title: 'Speak to Me / Breathe' },
        { album_id: DSOTM.id,    track_no: 2, title: 'On the Run' },
        { album_id: DSOTM.id,    track_no: 3, title: 'Time' },
        { album_id: DSOTM.id,    track_no: 4, title: 'The Great Gig in the Sky' },
        { album_id: DSOTM.id,    track_no: 5, title: 'Money' },
        { album_id: DSOTM.id,    track_no: 6, title: 'Us and Them' },
        { album_id: DSOTM.id,    track_no: 7, title: 'Any Colour You Like' },
        { album_id: DSOTM.id,    track_no: 8, title: 'Brain Damage' },
        { album_id: DSOTM.id,    track_no: 9, title: 'Eclipse' },
        // Wish You Were Here - insert them in the wrong order to check they get ordered by track_no
        { album_id: WYWH.id,     track_no: 4, title: 'Shine On You Crazy Diamond (Parts VI-IX)' },
        { album_id: WYWH.id,     track_no: 3, title: 'Have a Cigar' },
        { album_id: WYWH.id,     track_no: 2, title: 'Welcome to the Machine' },
        { album_id: WYWH.id,     track_no: 1, title: 'Shine On You Crazy Diamond (Parts I-V)' },
        // Foxtrot
        { album_id: Foxtrot.id,  track_no: 1, title: 'Watcher of the Skies' },
        { album_id: Foxtrot.id,  track_no: 2, title: 'Time Table' },
        { album_id: Foxtrot.id,  track_no: 3, title: "Get 'em Out by Friday" },
        { album_id: Foxtrot.id,  track_no: 4, title: 'Can-Utility and the Coastliners' },
        { album_id: Foxtrot.id,  track_no: 5, title: 'Horizons' },
        { album_id: Foxtrot.id,  track_no: 6, title: 'Dancing with the Moonlit Knight' },
        // Selling England by the Pound
        { album_id: Selling.id,  track_no: 1, title: 'I Know What I Like (In Your Wardrobe)' },
        { album_id: Selling.id,  track_no: 2, title: 'Firth of Fifth' },
        { album_id: Selling.id,  track_no: 3, title: 'More Fool Me' },
        { album_id: Selling.id,  track_no: 4, title: 'The Battle of Epping Forest' },
        { album_id: Selling.id,  track_no: 5, title: 'After the Ordeal' },
        { album_id: Selling.id,  track_no: 6, title: 'The Cinema Show' },
        { album_id: Selling.id,  track_no: 7, title: 'Aisle of Plenty' },
        { album_id: Selling.id,  track_no: 8, title: 'I Know What I Like (live at Knebworth)', bonus: 1 },
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
    'theBestAlbumEverRecorded',
    async t => {
      const album = await musicdb.one('theBestAlbumEverRecorded');
      t.is( album.title, 'The Dark Side of the Moon' );
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

  test.serial(
    'fetch album record',
    async t => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      t.is( dsotm.title, 'The Dark Side of the Moon' );
    }
  )

  test.serial(
    'fetch album artist relation',
    async t => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const artist = await dsotm.relation('artist');
      t.is( artist.name, 'Pink Floyd' );
    }
  )

  test.serial(
    'fetch album artist',
    async t => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const artist = await dsotm.artist;
      t.is( artist.name, 'Pink Floyd' );
    }
  )

  test.serial(
    'fetch album tracks',
    async t => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const tracks = await dsotm.tracks;
      t.is( tracks.length, 9 );
    }
  )

  test.serial(
    'fetch album tracks with sort order',
    async t => {
      const albums = await musicdb.model.albums;
      const wywh   = await albums.oneRecord({ title: 'Wish You Were Here' });
      const tracks = await wywh.tracks;
      t.is( tracks.length, 4 );
      t.is( tracks[0].track_no, 1 );
      t.is( tracks[1].track_no, 2 );
      t.is( tracks[2].track_no, 3 );
      t.is( tracks[3].track_no, 4 );
    }
  )
  test.serial(
    'fetch album bonus tracks',
    async t => {
      const albums = await musicdb.model.albums;
      const sebtp  = await albums.oneRecord({ title: 'Selling England by the Pound' });
      const tracks = await sebtp.tracks;
      t.is( tracks.length, 7 );
      t.is( tracks[0].track_no, 1 );
      t.is( tracks[1].track_no, 2 );
      t.is( tracks[2].track_no, 3 );
      t.is( tracks[3].track_no, 4 );
      const bonus = await sebtp.bonus_tracks;
      t.is( bonus.length, 1 );
      t.is( bonus[0].track_no, 8 );
    }
  )

  test.serial(
    'add album via artist addAlbum() method',
    async t => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const ahm = await floyd.addAlbum({
        title: 'Atom Heart Mother',
        year:  1970,
        tracks: [
          { track_no: 1, title: 'Atom Heart Mother' },
          { track_no: 2, title: 'If' },
          { track_no: 3, title: "Summer '68" },
          { track_no: 4, title: 'Fat Old Sun' },
          { track_no: 5, title: "Alan's Psychedelic Breakfast" },
        ]
      });
      t.is( ahm.title, 'Atom Heart Mother' );
      const tracks = await ahm.tracks;
      t.is( tracks.length, 5 );
      t.is( tracks[0].track_no, 1 );
      t.is( tracks[0].title, 'Atom Heart Mother' );
      t.is( tracks[1].track_no, 2 );
      t.is( tracks[1].title, 'If' );
      t.is( tracks[2].track_no, 3 );
      t.is( tracks[2].title, "Summer '68" );
      t.is( tracks[3].track_no, 4 );
      t.is( tracks[3].title, 'Fat Old Sun' );
      t.is( tracks[4].track_no, 5 );
      t.is( tracks[4].title, "Alan's Psychedelic Breakfast" );
    }
  )
  test.serial(
    'fetch albums via artist.albums relation',
    async t => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const albums = await floyd.albums;
      t.is( albums.length, 3 );
      t.is( albums[0].title, 'Atom Heart Mother' );
      t.is( albums[1].title, 'The Dark Side of the Moon' );
      t.is( albums[2].title, 'Wish You Were Here' );
    }
  )
  test.serial(
    'fetch all album tracks via artists table album_tracks query',
    async t => {
      const artists = await musicdb.model.artists;
      const floyd   = await artists.oneRecord({ name: 'Pink Floyd' });
      const tracks  = await artists.all('album_tracks', [floyd.row.id]);
      t.is( tracks.length, 18 );
      t.is( tracks[0].title, 'Atom Heart Mother' );
      t.is( tracks[0].album, 'Atom Heart Mother' );
      t.is( tracks[0].year, 1970 );
      t.is( tracks[17].title, 'Shine On You Crazy Diamond (Parts VI-IX)' );
      t.is( tracks[17].album, 'Wish You Were Here' );
      t.is( tracks[17].year, 1975 );
    }
  )
  test.serial(
    'fetch all album tracks via artist.album_tracks relation',
    async t => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const tracks = await floyd.album_tracks;
      t.is( tracks.length, 18 );
      t.is( tracks.length, 18 );
      t.is( tracks[0].title, 'Atom Heart Mother' );
      t.is( tracks[0].album, 'Atom Heart Mother' );
      t.is( tracks[0].year, 1970 );
      t.is( tracks[17].title, 'Shine On You Crazy Diamond (Parts VI-IX)' );
      t.is( tracks[17].album, 'Wish You Were Here' );
      t.is( tracks[17].year, 1975 );
    }
  )
}