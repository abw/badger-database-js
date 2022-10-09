import { Table } from '@abw/badger-database';
import Album from '../Record/Album.js';

class Albums extends Table {
  configure(schema) {
    schema.recordClass = Album;
    schema.columns = 'id:readonly year:required title:required artist_id:required',
    schema.relations = {
      artist: 'arist_id -> artists.id',
      tracks: {
        type:  'many',
        from:  'id',
        table: 'tracks',
        to:    'album_id',
        order: 'track_no'
      }
    }
    return schema;
  }
}

export default Albums