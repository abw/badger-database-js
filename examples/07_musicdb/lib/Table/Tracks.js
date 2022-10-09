import { Table } from '@abw/badger-database';
import Track from '../Record/Track.js';

class Tracks extends Table {
  configure(schema) {
    schema.recordClass = Track;
    schema.columns = 'id:readonly title:required album_id:required track_no:required bonus';
    schema.relations = {
      album: 'album_id -> album.id'
    }
    return schema;
  }
}

export default Tracks
