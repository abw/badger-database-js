import { connect } from "../../src/Database.js";
import Record from "../../src/Record.js";
import Table from "../../src/Table.js";

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

export const musicFragments = {
  selectAlbumsWithTrackCount: `
    SELECT    albums.title,
              COUNT(tracks.id) as n_tracks
    FROM      albums
    JOIN      tracks
    ON        tracks.album_id=albums.id
    GROUP BY  albums.id`
}

export const musicQueries = {
  createArtistsTable: `
    CREATE TABLE artists (
      id        INTEGER PRIMARY KEY ASC,
      name      TEXT
    )`,
  createAlbumsTable: `
    CREATE TABLE albums (
      id        INTEGER PRIMARY KEY ASC,
      year      INTEGER,
      title     TEXT,
      artist_id INTEGER,
      FOREIGN KEY(artist_id) REFERENCES artists(id)
    )`,
  createTracksTable: `
    CREATE TABLE tracks (
      id        INTEGER PRIMARY KEY ASC,
      title     TEXT,
      album_id  INTEGER,
      FOREIGN KEY(album_id) REFERENCES albums(id)
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
}

export const albumsFragments = {
  selectTitleAndTrackCount:`
    SELECT    albums.title,
              COUNT(tracks.id) as n_tracks
    FROM      albums
    JOIN      tracks
    ON        tracks.album_id=albums.id
    GROUP BY  albums.id`
}

export const albumsQueries = {
  selectByNumberOfTracks:`
    <selectTitleAndTrackCount>
    ORDER BY  n_tracks`,
  titleByYear:`
    SELECT    <titleYear>
    FROM      <table>
    ORDER BY  year,id
  `
}

export const musicTables = {
  artists: {
    columns:      'id name',
    tableClass:   Artists,
    recordClass:  Artist
  },
  albums: {
    columns:        'id title year artist_id',
    virtualColumns: {
      titleYear:    'title || " (" || year || ")"',
    },
    tableClass:     Albums,
    recordClass:    Album,
    // tableOptions:   { debug: true },
    // recordOptions:  { debug: true },
    fragments:      albumsFragments,
    queries:        albumsQueries,
    relations: {
      artist: {
        type:       'one',
        table:      'artists',
        localKey:   'artist_id',
        remoteKey:  'id',
        // debug:      true,
      },
      tracks: {
        type:       'many',
        table:      'tracks',
        localKey:   'id',
        remoteKey:  'album_id',
        // debug:      true,
      }
    }
  },
  tracks: {
    columns:      'id title album_id',
    tableClass:   Tracks,
    recordClass:  Track
  },
};

export const musicdb = connect({
  database:    'sqlite:memory',
  tables:    musicTables,
  fragments: musicFragments,
  queries: musicQueries
});

export const createMusicDb = async () => {
  await musicdb;
  await database.raw("CREATE TABLE artists (id INTEGER PRIMARY KEY ASC, name TEXT)");
  await database.raw("CREATE TABLE albums (id INTEGER PRIMARY KEY ASC, year INTEGER, title TEXT, artist_id INTEGER, FOREIGN KEY(artist_id) REFERENCES artists(id))");
  await database.raw("CREATE TABLE tracks (id INTEGER PRIMARY KEY ASC, title TEXT, album_id INTEGER, FOREIGN KEY(album_id) REFERENCES albums(id))");

  const artists = database.table('artists');
  const albums  = database.table('albums');
  const tracks  = database.table('tracks');

  const [PinkFloyd, Genesis] = await artists.insert([
    { name: 'Pink Floyd' },
    { name: 'Genesis' },
  ])
  // console.log('Pink Floyd: ', PinkFloyd);
  // console.log('Genesis: ', Genesis);

  const [DSOTM, WYWH] = await albums.insert([
    { artist_id: PinkFloyd.id, year: 1973, title: 'The Dark Side of the Moon' },
    { artist_id: PinkFloyd.id, year: 1975, title: 'Wish You Were Here' },
  ]);

  const [Foxtrot, Selling] = await albums.insert([
    { artist_id: Genesis.id, year: 1972, title: 'Foxtrot', },
    { artist_id: Genesis.id, year: 1973, title: 'Selling England by the Pound', },
  ]);

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
}
