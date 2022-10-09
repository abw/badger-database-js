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
  async albumList() {
    const albums = await this.relation('albums');
    console.log("\nAlbums by %s:", this.row.name);
    albums.forEach(
      album => console.log("  - %s (%s)", album.title, album.year)
    );
  }
  async trackList() {
    const tracks = await this.relation('album_tracks');
    console.log("\nAlbum tracks by %s:", this.row.name);
    tracks.forEach(
      track => console.log(
        "  - %s\n    %s (%s) track %s",
        track.title, track.album, track.year, track.track_no
      )
    );
  }
}

export default Artist