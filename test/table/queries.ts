import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { ConnectConfig, DatabaseInstance, TableInstance } from '@/src/types'

let db: DatabaseInstance;
let floydId;

const dbConfig: ConnectConfig = {
  database: 'sqlite:memory',
  fragments: {
    selectStar: 'SELECT *',
  },
  queries: {
    helloWorld:    'SELECT "hello world"',
    selectTable:   'SELECT * FROM <table>',
    selectArtists: '<selectStar> FROM artists'
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
          table => table.select('id year title').where('title'),
        byYear:
          table => table.select().where('year'),
      }
    }
  }
}

test( 'connect',
  () => {
    db = connect(dbConfig);
    expect(db.engine.engine).toBe('sqlite')
  }
);

test( 'create artists table',
  async () => {
    const artists = await db.table('artists')
    const result = await artists.run('create')
    expect(result.changes).toBe(0)
  }
)

test( 'create albums table',
  async () => {
    const albums = await db.table('albums')
    const result = await albums.run('create')
    expect(result.changes).toBe(0)
  }
)

test( 'insert artist',
  async () => {
    const artists = await db.table('artists')
    const artist  = await artists.insert({ name: 'Pink Floyd'})
    floydId       = artist.id
    expect(floydId).toBe(1)
  }
)

test( 'insert albums',
  async () => {
    const albums = await db.table('albums')

    const dsotm  = await albums.insert({
      artist_id: floydId,
      year: 1973,
      title: 'The Dark Side of the Moon'
    })
    expect(dsotm.id).toBe(1)

    const wywh   = await albums.insert({
      artist_id: floydId,
      year: 1975,
      title: 'Wish You Were Here'
    })
    expect(wywh.id).toBe(2)
  }
)

test( 'fetch albums',
  async () => {
    const albums   = await db.table('albums')
    const pfalbums = await albums.all('byArtistId', [floydId])
    expect(pfalbums.length).toBe(2)
    expect(pfalbums[0].title).toBe('The Dark Side of the Moon')
    expect(pfalbums[1].title).toBe('Wish You Were Here')
  }
);

test( 'fetch album by title',
  async () => {
    const albums = await db.table('albums')
    const dsotm  = await albums.one('byTitle', ['The Dark Side of the Moon'])
    expect( dsotm.id).toBe(1)
    expect( dsotm.title).toBe('The Dark Side of the Moon')
    expect( dsotm.year).toBe(1973)
  }
);

test( 'select() query',
  async () => {
    const albums = await db.table('albums')
    const sql    = albums.select().sql()
    expect(sql).toBe('SELECT "albums"."id", "albums"."year", "albums"."title", "albums"."artist_id"\nFROM "albums"')
  }
)

test( 'fetch album by year',
  async () => {
    const albums = await db.table('albums')
    const dsotm  = await albums.one('byYear', [1973])
    expect(dsotm.id).toBe(1)
    expect(dsotm.title).toBe('The Dark Side of the Moon')
    expect(dsotm.year).toBe(1973)
  }
);

test( 'use database query from table',
  async () => {
    const albums = await db.table('albums')
    const sql    = albums.sql('helloWorld')
    expect(sql).toBe('SELECT "hello world"')
  }
)

test( 'use database query with table fragments',
  async () => {
    const albums = await db.table('albums')
    const sql    = albums.sql('selectTable')
    expect(sql).toBe('SELECT * FROM "albums"')
  }
)

test( 'use database query with database fragments',
  async () => {
    const albums = await db.table('albums')
    const sql    = albums.sql('selectArtists')
    expect(sql).toBe('SELECT * FROM artists')
  }
)

test( 'use database fragments from table',
  async () => {
    const albums = await db.table('albums')
    const sql    = albums.sql('<selectStar> FROM users')
    expect(sql).toBe('SELECT * FROM users')
  }
)

test( 'disconnect',
  () => db.disconnect()
)