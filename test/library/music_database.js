import { expect, test } from 'vitest'
import Record from '../../src/Record.js'
import Table from '../../src/Table.js'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { setDebug } from '../../src/Utils/Debug.js'
import { remove } from '@abw/badger-utils'
import { pass } from './expect.js'

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
  async albumTracks() {
    const artists = this.table;
    const rows = await artists.all(
      'album_tracks',
      [this.row.id]
    )
    return artists.records(rows);
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
      albumsByYear: {
        relation: 'id #> albums.artist_id',
        key: 'year',
        value: 'title'
      },
      album_tracks: {
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

  const musicdb = connect({
    database, tables, fragments, queries
  });

  return musicdb;
}

//-----------------------------------------------------------------------------
// Run numerous tests
//-----------------------------------------------------------------------------
export const runMusicDatabaseTests = async (database, options) => {
  console.log(`running music database tests`)

  const musicdb = await connectMusicDatabase(database, options)
  const artists = await musicdb.table('artists');
  const albums  = await musicdb.table('albums');
  const tracks  = await musicdb.table('tracks');
  let PinkFloyd, Genesis;
  let DSOTM, WYWH;
  let Foxtrot, Selling;

  test( 'drop existing tables',
    async () => {
      await musicdb.run('dropTracksTable')
      await musicdb.run('dropAlbumsTable')
      await musicdb.run('dropArtistsTable')
      pass()
    }
  )

  test( 'create artists',
    async () => {
      await musicdb.run('createArtistsTable')
      pass()
    }
  )

  test( 'create albums',
    async () => {
      await musicdb.run('createAlbumsTable')
      pass()
    }
  )

  test( 'create tracks',
    async () => {
      await musicdb.run('createTracksTable');
      pass();
    }
  )

  test( 'insert artists',
    async () => {
      [PinkFloyd, Genesis] = await artists.insert(
        [
          { name: 'Pink Floyd' },
          { name: 'Genesis' },
        ],
        { reload: true }
      )
      expect(PinkFloyd.id).toBe(1)
      expect(PinkFloyd.name).toBe('Pink Floyd')
      expect(Genesis.id).toBe(2)
      expect(Genesis.name).toBe('Genesis')
    }
  )

  test( 'insert Pink Floyd albums',
    async () => {
      [DSOTM, WYWH] = await albums.insert(
        [
          { artist_id: PinkFloyd.id, year: 1973, title: 'The Dark Side of the Moon' },
          { artist_id: PinkFloyd.id, year: 1975, title: 'Wish You Were Here' },
        ],
        { reload: true }
      );
      expect(DSOTM.id).toBe(1)
      expect(DSOTM.year).toBe(1973)
      expect(WYWH.id).toBe(2)
      expect(WYWH.year).toBe(1975)
    }
  )

  test( 'insert Genesis albums',
    async () => {
      [Foxtrot, Selling] = await albums.insert(
        [
          { artist_id: Genesis.id, year: 1972, title: 'Foxtrot', },
          { artist_id: Genesis.id, year: 1973, title: 'Selling England by the Pound', },
        ],
        { reload: true }
      );
      expect(Foxtrot.id).toBe(3)
      expect(Foxtrot.year).toBe(1972)
      expect(Selling.id).toBe(4)
      expect(Selling.year).toBe(1973)
    }
  )

  test( 'insert tracks',
    async () => {
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
      pass();
    }
  )

  test( 'raw SQL query',
    async () => {
      const albumList = await albums.all('SELECT * FROM albums WHERE id=2');
      expect(albumList.length).toBe(1)
      expect(albumList[0].title).toBe('Wish You Were Here')
    }
  )

  test( 'selectByNumberOfTracks',
    async () => {
      const albumList = await albums.all('selectByNumberOfTracks');
      expect(albumList.length).toBe(4)
      expect(albumList[0].title).toBe('Wish You Were Here')
      expect(parseInt(albumList[0].n_tracks)).toBe(4)
      expect(albumList[1].title).toBe('Foxtrot')
      expect(parseInt(albumList[1].n_tracks)).toBe(6)
      expect(albumList[2].title).toBe('Selling England by the Pound')
      expect(parseInt(albumList[2].n_tracks)).toBe(7)
      expect(albumList[3].title).toBe('The Dark Side of the Moon')
      expect(parseInt(albumList[3].n_tracks)).toBe(9)
    }
  )

  test( 'theBestAlbumEverRecorded',
    async () => {
      const album = await musicdb.one('theBestAlbumEverRecorded')
      expect(album.title).toBe('The Dark Side of the Moon')
    }
  )

  test( 'titleByYear',
    async () => {
      const albumList = await albums.all('titleByYear');
      expect(albumList.length).toBe(4)
      expect(albumList[0].title_year).toBe('Foxtrot (1972)')
      expect(albumList[1].title_year).toBe('The Dark Side of the Moon (1973)')
      expect(albumList[2].title_year).toBe('Selling England by the Pound (1973)')
      expect(albumList[3].title_year).toBe('Wish You Were Here (1975)')
    }
  )

  test( 'SQL with embedded fragments',
    async () => {
      const albumList = await albums.all('SELECT <columns> FROM <table> ORDER BY year,id');
      expect(albumList.length).toBe(4)
      expect(albumList[0].title).toBe('Foxtrot')
      expect(albumList[1].title).toBe('The Dark Side of the Moon')
      expect(albumList[2].title).toBe('Selling England by the Pound')
      expect(albumList[3].title).toBe('Wish You Were Here')
    }
  )

  test( 'fetch album record',
    async () => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      expect(dsotm.title).toBe('The Dark Side of the Moon')
    }
  )

  test( 'fetch album artist relation',
    async () => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const artist = await dsotm.relation('artist');
      expect(artist.name).toBe('Pink Floyd')
    }
  )

  test( 'fetch album artist',
    async () => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const artist = await dsotm.artist;
      expect(artist.name).toBe('Pink Floyd')
    }
  )

  test( 'fetch album tracks',
    async () => {
      const albums = await musicdb.model.albums;
      const dsotm  = await albums.oneRecord({ title: 'The Dark Side of the Moon' });
      const tracks = await dsotm.tracks;
      expect(tracks.length).toBe(9)
    }
  )

  test( 'fetch album tracks with sort order',
    async () => {
      const albums = await musicdb.model.albums;
      const wywh   = await albums.oneRecord({ title: 'Wish You Were Here' });
      const tracks = await wywh.tracks;
      expect(tracks.length).toBe(4)
      expect(tracks[0].track_no).toBe(1)
      expect(tracks[1].track_no).toBe(2)
      expect(tracks[2].track_no).toBe(3)
      expect(tracks[3].track_no).toBe(4)
    }
  )

  test( 'fetch album bonus tracks',
    async () => {
      const albums = await musicdb.model.albums;
      const sebtp  = await albums.oneRecord({ title: 'Selling England by the Pound' });
      const tracks = await sebtp.tracks;
      expect(tracks.length).toBe(7)
      expect(tracks[0].track_no).toBe(1)
      expect(tracks[1].track_no).toBe(2)
      expect(tracks[2].track_no).toBe(3)
      expect(tracks[3].track_no).toBe(4)
      const bonus = await sebtp.bonus_tracks;
      expect(bonus.length).toBe(1)
      expect(bonus[0].track_no).toBe(8)
    }
  )

  test( 'add album via artist addAlbum() method',
    async () => {
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
      expect(ahm.title).toBe('Atom Heart Mother')
      const tracks = await ahm.tracks;
      expect(tracks.length).toBe(5)
      expect(tracks[0].track_no).toBe(1)
      expect(tracks[0].title).toBe('Atom Heart Mother')
      expect(tracks[1].track_no).toBe(2)
      expect(tracks[1].title).toBe('If')
      expect(tracks[2].track_no).toBe(3)
      expect(tracks[2].title).toBe("Summer '68")
      expect(tracks[3].track_no).toBe(4)
      expect(tracks[3].title).toBe('Fat Old Sun')
      expect(tracks[4].track_no).toBe(5)
      expect(tracks[4].title).toBe("Alan's Psychedelic Breakfast")
    }
  )

  test( 'fetch albums via artist.albums relation',
    async () => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const albums = await floyd.albums;
      expect(albums.length).toBe(3)
      expect(albums[0].title).toBe('Atom Heart Mother')
      expect(albums[1].title).toBe('The Dark Side of the Moon')
      expect(albums[2].title).toBe('Wish You Were Here')
    }
  )

  test( 'fetch albums via artist.albumsByYear map relation',
    async () => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const albums = await floyd.albumsByYear;
      expect(albums[1970]).toBe('Atom Heart Mother')
      expect(albums[1973]).toBe('The Dark Side of the Moon')
      expect(albums[1975]).toBe('Wish You Were Here')
    }
  )

  test( 'fetch all album tracks via artists table album_tracks query',
    async () => {
      const artists = await musicdb.model.artists;
      const floyd   = await artists.oneRecord({ name: 'Pink Floyd' });
      const tracks  = await artists.all('album_tracks', [floyd.row.id]);
      expect(tracks.length).toBe(18)
      expect(tracks[0].title).toBe('Atom Heart Mother')
      expect(tracks[0].album).toBe('Atom Heart Mother')
      expect(tracks[0].year).toBe(1970)
      expect(tracks[17].title).toBe('Shine On You Crazy Diamond (Parts VI-IX)')
      expect(tracks[17].album).toBe('Wish You Were Here')
      expect(tracks[17].year).toBe(1975)
    }
  )

  test( 'fetch all album tracks via artists record albumTracks method',
    async () => {
      const artists = await musicdb.model.artists;
      const floyd   = await artists.oneRecord({ name: 'Pink Floyd' });
      const tracks  = await floyd.albumTracks();
      expect(tracks.length).toBe(18)
      expect(tracks[0].title).toBe('Atom Heart Mother')
      expect(tracks[0].album).toBe('Atom Heart Mother')
      expect(tracks[0].year).toBe(1970)
      expect(tracks[17].title).toBe('Shine On You Crazy Diamond (Parts VI-IX)')
      expect(tracks[17].album).toBe('Wish You Were Here')
      expect(tracks[17].year).toBe(1975)
    }
  )

  test( 'fetch all album tracks via artist.album_tracks relation',
    async () => {
      const artists = await musicdb.model.artists;
      const floyd = await artists.oneRecord({ name: 'Pink Floyd' });
      const tracks = await floyd.album_tracks;
      expect(tracks.length).toBe(18)
      expect(tracks.length).toBe(18)
      expect(tracks[0].title).toBe('Atom Heart Mother')
      expect(tracks[0].album).toBe('Atom Heart Mother')
      expect(tracks[0].year).toBe(1970)
      expect(tracks[17].title).toBe('Shine On You Crazy Diamond (Parts VI-IX)')
      expect(tracks[17].album).toBe('Wish You Were Here')
      expect(tracks[17].year).toBe(1975)
    }
  )

  test( 'disconnect()',
    () => musicdb.disconnect()
  )
}