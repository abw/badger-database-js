import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { pass } from '../library/expect.js'

let db;

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      fragments: {
        hello: 'Hello',
        world: 'World',
      },
      queries: {
        helloWorld: '<hello> <world>!',
      }
    });
    pass("created database")
  }
);

test( 'named query',
  async () => {
    const hw = db.sql('helloWorld');
    expect(hw).toBe('Hello World!')
  }
)

test( 'query with embedded fragments',
  async () => {
    const hw = db.sql('<hello> Everyone!');
    expect(hw).toBe('Hello Everyone!')
  }
)

test( 'rebuild database',
  () => {
    db.disconnect();
    db = connect({
      database: 'sqlite:memory',
      queries: {
        createArtistsTable: `
          CREATE TABLE artists (
            id   INTEGER PRIMARY KEY ASC,
            name TEXT
          )`,
        insertArtist: `
          INSERT INTO artists (name) VALUES (?)
        `,
        selectArtistById: `
          SELECT * FROM artists WHERE id=?
        `,
        selectAllArtists: `
          SELECT * FROM artists
        `,
      }
    });
    pass("created music database")
  }
);

test( 'create table',
  async () => {
    const c1 = await db.run('createArtistsTable');
    expect(c1.changes).toBe(0)
  }
)

test( 'insert artist',
  async () => {
    const insert = await db.run('insertArtist', ['Pink Floyd']);
    expect(insert.changes).toBe(1)
    expect(insert.lastInsertRowid).toBe(1)
  }
)

test( 'insert artist with insert option',
  async () => {
    const insert = await db.run('insertArtist', ['Genesis'], { sanitizeResult: true });
    expect(insert.changes).toBe(1)
    expect(insert.id).toBe(2)
  }
)

test( 'select any artist',
  async () => {
    const pf = await db.any('selectArtistById', [1]);
    expect(pf.id).toBe(1)
    expect(pf.name).toBe('Pink Floyd')
  }
)

test( 'select one artist',
  async () => {
    const pf = await db.one('selectArtistById', [1]);
    expect(pf.id).toBe(1)
    expect(pf.name).toBe('Pink Floyd')
  }
)

test( 'select all artists',
  async () => {
    const artists = await db.all('selectAllArtists');
    expect(artists.length).toBe(2)
    expect(artists[0].id).toBe(1)
    expect(artists[0].name).toBe('Pink Floyd')
    expect(artists[1].id).toBe(2)
    expect(artists[1].name).toBe('Genesis')
  }
)

test( 'disconnect',
  () => db.disconnect()
)