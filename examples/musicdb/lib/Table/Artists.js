import { Table } from '@abw/badger-database';
import Artist from '../Record/Artist.js';

class Artists extends Table {
  configure(schema) {
    schema.recordClass = Artist;
    schema.columns = 'id:readonly name:required';
    schema.queries = {
      album_tracks: `
        SELECT    tracks.*, albums.title as album, albums.year
        FROM      albums
        JOIN      tracks
        ON        tracks.album_id=albums.id
        WHERE     albums.artist_id=?
        ORDER BY  albums.year,tracks.track_no
      `
    },
    schema.relations = {
      albums: {
        relation: 'id => albums.artist_id',
        order:    'year'
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
    return schema;
  }
}

export default Artists