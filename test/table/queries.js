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
        byArtistId:
          `SELECT <columns> FROM <table> WHERE artist_id=?`,
        byTitle:
          table => table.select('id year title').from('albums').where('title'),
        byYear:
          table => table.selectFrom.where('year'),
      }
    }
  }
}

test.before( 'connect',
  t => {
    db = connect(dbConfig);
    t.pass("created music database")
  }
);

test.serial( 'create artists table',
  async t => {
    const artists = await db.table('artists');
    const result = await artists.run('create');
    t.is( result.changes, 0 );
  }
)

test.serial( 'create albums table',
  async t => {
    const albums = await db.table('albums');
    const result = await albums.run('create');
    t.is( result.changes, 0 );
  }
)

test.serial( 'insert artist',
  async t => {
    const artists = await db.table('artists');
    const artist  = await artists.insert({ name: 'Pink Floyd'});
    floydId       = artist.id;
    t.is( floydId, 1 );
  }
)

test.serial( 'insert albums',
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

test.serial( 'fetch albums',
  async t => {
    const albums   = await db.table('albums');
    const pfalbums = await albums.all('byArtistId', [floydId]);
    t.is( pfalbums.length, 2 );
    t.is( pfalbums[0].title, 'The Dark Side of the Moon' );
    t.is( pfalbums[1].title, 'Wish You Were Here' );
  }
);

test.serial( 'fetch album by title',
  async t => {
    const albums = await db.table('albums');
    const dsotm  = await albums.one('byTitle', ['The Dark Side of the Moon']);
    t.is( dsotm.id, 1 );
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    t.is( dsotm.year, 1973 );
  }
);

test.serial( 'selectFrom query',
  async t => {
    const albums = await db.table('albums');
    const sql    = albums.selectFrom.sql();
    t.is( sql, 'SELECT "albums"."id", "albums"."year", "albums"."title", "albums"."artist_id"\nFROM "albums"' )
  }
)

test.serial( 'fetch album by year',
  async t => {
    const albums = await db.table('albums');
    const dsotm  = await albums.one('byYear', [1973]);
    t.is( dsotm.id, 1 );
    t.is( dsotm.title, 'The Dark Side of the Moon' );
    t.is( dsotm.year, 1973 );
  }
);

test.after( 'disconnect',
  () => db.disconnect()
)