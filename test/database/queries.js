import test from 'ava';
import { database } from '../../src/Database.js';

let db;

test.before(
  'connect to database',
  async t => {
    db = await database({
      engine: 'sqlite:memory',
      fragments: {
        hello: 'Hello',
        world: 'World',
      },
      queries: {
        helloWorld: '<hello> <world>!',
      }
    });
    t.pass("created music database")
  }
);

test.serial(
  'named query',
  async t => {
    const hw = db.query('helloWorld');
    t.is(hw, 'Hello World!');
  }
)

test.serial(
  'query with embedded fragments',
  async t => {
    const hw = db.query('<hello> Everyone!');
    t.is(hw, 'Hello Everyone!');
  }
)

test.serial(
  'rebuild database',
  async t => {
    await db.destroy();
    db = await database({
      engine: 'sqlite:memory',
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
    t.pass("created music database")
  }
);

test.serial(
  'create table',
  async t => {
    const c1 = await db.run('createArtistsTable');
    t.is(c1.changes, 0);
  }
)

test.serial(
  'insert artist',
  async t => {
    const insert = await db.run('insertArtist', ['Pink Floyd']);
    t.is(insert.changes, 1);
    t.is(insert.lastInsertRowid, 1);
  }
)

test.serial(
  'insert artist with insert option',
  async t => {
    const insert = await db.run('insertArtist', ['Genesis'], { insert: true });
    t.is(insert.changes, 1);
    t.is(insert.id, 2);
  }
)

test.serial(
  'select any artist',
  async t => {
    const pf = await db.any('selectArtistById', [1]);
    t.is(pf.id, 1);
    t.is(pf.name, 'Pink Floyd');
  }
)

test.serial(
  'select one artist',
  async t => {
    const pf = await db.one('selectArtistById', [1]);
    t.is(pf.id, 1);
    t.is(pf.name, 'Pink Floyd');
  }
)

test.serial(
  'select all artists',
  async t => {
    const artists = await db.all('selectAllArtists');
    t.is(artists.length, 2);
    t.is(artists[0].id, 1);
    t.is(artists[0].name, 'Pink Floyd');
    t.is(artists[1].id, 2);
    t.is(artists[1].name, 'Genesis');
  }
)
