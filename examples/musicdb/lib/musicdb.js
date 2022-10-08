import connect from '@abw/badger-database'
import Album from './Album.js';

export const connectMusicDb = async () => {
  const musicdb = await connect({
    database: 'sqlite:memory',
    queries: {
      createArtists: `
        CREATE TABLE artists (
          id        INTEGER PRIMARY KEY ASC,
          name      TEXT
        )`,
      createAlbums: `
        CREATE TABLE albums (
          id        INTEGER PRIMARY KEY ASC,
          year      INTEGER,
          title     TEXT,
          artist_id INTEGER,
          FOREIGN KEY (artist_id) REFERENCES artists(id)
        )`,
      createTracks: `
        CREATE TABLE tracks (
          id        INTEGER PRIMARY KEY ASC,
          title     TEXT,
          album_id  INTEGER,
          track_no  INTEGER,
          bonus     BOOLEAN DEFAULT false,
          FOREIGN KEY (album_id) REFERENCES albums(id)
        )`,
    },
    tables: {
      artists: {
        columns: 'id:readonly name:required',
        relations: {
          albums: 'id => albums.artist_id'
        }
      },
      albums: {
        columns: 'id:readonly year:required title:required artist_id:required',
        recordClass: Album,
        relations: {
          artist: 'arist_id -> artists.id',
          tracks: {
            type:  'many',
            from:  'id',
            table: 'tracks',
            to:    'album_id',
            order: 'track_no'
          }
        }
      },
      tracks: {
        columns: 'id:readonly title:required album_id:required track_no:required bonus',
        relations: {
          album: 'album_id -> album.id'
        }
      }
    }
  })

  await musicdb.run('createArtists');
  await musicdb.run('createAlbums');
  await musicdb.run('createTracks');

  return musicdb;
}

export default connectMusicDb