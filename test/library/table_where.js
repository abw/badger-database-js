import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { serialTypeFragment } from './users_table.js';

export function runTableWhereTests(engine) {
  const database = databaseConfig(engine);
  const serial = serialTypeFragment(engine);
  // we can't use the 'albums' table here because foreign key constraints
  // will fail when we try to drop it
  const table = 'where_albums';
  let db;

  // connect to the database
  test.serial(
    'connect',
    async t => {
      db = await connect({
        database,
        tables: {
          albums: {
            table,
            columns: 'id:readonly title:required year:required',
            queries: {
              drop:
                `DROP TABLE IF EXISTS ${table}`,
              create: `
                CREATE TABLE ${table} (
                  id    ${serial},
                  year  INTEGER,
                  title TEXT
                )`
            }
          }
        }
      });
      t.pass();
    }
  )

  test.serial(
    'drop table',
    async t => {
      await db.waiter.model.albums.run('drop');
      t.pass();
    }
  )

  test.serial(
    'create table',
    async t => {
      await db.waiter.model.albums.run('create');
      t.pass();
    }
  );

  test.serial(
    'insert some rows',
    async t => {
      const albums = await db.waiter.model.albums.insertRows([
        { year: 1970, title: 'Atom Heart Mother' },
        { year: 1973, title: 'The Dark Side of the Moon' },
        { year: 1975, title: 'Wish You Were Here' },
        { year: 1979, title: 'The Wall' },
        { year: 1983, title: 'The Final Cut' },
      ]);
      t.is( albums.length, 5 );
    }
  )

  test.serial(
    'select a row',
    async t => {
      const albums = await db.waiter.model.albums.allRows({
        year: 1973,
      });
      t.is( albums.length, 1 );
      t.is( albums[0].title, 'The Dark Side of the Moon' );
    }
  )

  test.serial(
    'select a series of rows',
    async t => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['>', 1973],
      });
      t.is( albums.length, 3 );
      t.is( albums[0].title, 'Wish You Were Here' );
      t.is( albums[1].title, 'The Wall' );
      t.is( albums[2].title, 'The Final Cut' );
    }
  )


  test.serial(
    'disconnect',
    t => {
      db.disconnect();
      t.pass();
    }
  )
}