import { Table } from '@abw/badger-database';
import Artist from '../Record/Artist.js';

class Artists extends Table {
  configure(schema) {
    schema.recordClass = Artist;
    schema.columns = 'id:readonly name:required';
    schema.relations = {
      albums: 'id => albums.artist_id'
    }
    return schema;
  }
}

export default Artists