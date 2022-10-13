import connect from '@abw/badger-database'
import Queries from './Database/Queries.js';
import Albums from './Table/Albums.js';
import Artists from './Table/Artists.js';
import Tracks from './Table/Tracks.js';

export const connectMusicDb = async () => {
  const musicdb = connect({
    database: 'sqlite:memory',
    queries: Queries,
    tables: {
      artists: Artists,
      albums:  Albums,
      tracks:  Tracks,
    }
  })

  await musicdb.run('createArtists');
  await musicdb.run('createAlbums');
  await musicdb.run('createTracks');

  return musicdb;
}

export default connectMusicDb