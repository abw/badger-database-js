import { Record } from "@abw/badger-database";

class Album extends Record {
  async insertTracks(tracks) {
    const table = await this.database.table('tracks');
    await table.insert(
      tracks.map( track => ({ ...track, album_id: this.row.id }))
    );
  }
  async trackListing() {
    const tracks = await this.relation('tracks');
    console.log('Track listing for %s:', this.row.title);
    tracks.forEach(
      track => console.log("  %s: %s", track.track_no, track.title)
    );
  }
}

export default Album