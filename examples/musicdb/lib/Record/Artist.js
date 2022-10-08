import { Record } from "@abw/badger-database";
import { remove } from "@abw/badger-utils";

class Artist extends Record {
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

export default Artist