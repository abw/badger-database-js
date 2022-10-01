import test from 'ava';
import { connect } from '../../src/Database.js';

let db;
let floydId;
const dbConfig = {
  database: 'sqlite:memory',
  queries: {
  },
  tables: {
    artists: {
      columns: 'id:readonly name:required',
      queries: {
        create: `
          CREATE TABLE artists (
            id        INTEGER PRIMARY KEY ASC,
            name      TEXT
          )`,
      }
    },
    albums: {
      columns: 'id:readonly year:required title:required artist_id:required',
      queries: {
        create: `
          CREATE TABLE albums (
            id        INTEGER PRIMARY KEY ASC,
            year      INTEGER,
            title     TEXT,
            artist_id INTEGER,
            FOREIGN KEY(artist_id) REFERENCES artists(id)
          )`,
        byArtistId: `SELECT <columns> FROM <table> WHERE artist_id=?`
      }
    }
  }
}

test.before(
  'create database',
  async t => {
    db = await connect(dbConfig);
    t.pass("created music database")
  }
);

test.serial(
  'create artists table',
  async t => {
    const artists = await db.table('artists');
    const result = await artists.run('create');
    t.is( result.changes, 0 );
  }
)

test.serial(
  'create albums table',
  async t => {
    const albums = await db.table('albums');
    const result = await albums.run('create');
    t.is( result.changes, 0 );
  }
)

test.serial(
  'insert artist',
  async t => {
    const artists = await db.table('artists');
    const artist  = await artists.insert({ name: 'Pink Floyd'});
    floydId       = artist.id;
    t.is( floydId, 1 );
  }
)

test.serial(
  'insert albums',
  async t => {
    const albums = await db.table('albums');

    const dsotm  = await albums.insert({
      artist_id: floydId,
      year: 1973,
      title: 'The Dark Side of the Moon'
    });
    t.is( dsotm.id, 1 );

    const wywh   = await albums.insert({
      artist_id: floydId,
      year: 1975,
      title: 'Wish You Were Here'
    });
    t.is( wywh.id, 2 );
  }
)

test.serial(
  'fetch albums',
  async t => {
    const albums   = await db.table('albums');
    const pfalbums = await albums.all('byArtistId', [floydId]);
    t.is( pfalbums.length, 2 );
    t.is( pfalbums[0].title, 'The Dark Side of the Moon' );
    t.is( pfalbums[1].title, 'Wish You Were Here' );
  }
);
