export const Queries = {
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
};

export default Queries
