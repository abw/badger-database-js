import test from 'ava';
import { connect } from '../../src/Database.js';
import { databaseConfig } from './database.js';
import { serialTypeFragment } from './users_table.js';

export function runTableInTests(engine) {
  const database = databaseConfig(engine);
  const serial = serialTypeFragment(engine);
  // we can't use the 'albums' table here because foreign key constraints
  // will fail when we try to drop it
  const table = 'in_albums';
  let db;

  test.serial( 'connect',
    t => {
      db = connect({
        database,
        tables: {
          albums: {
            table,
            columns: 'id:readonly title:required year:required classic',
            queries: {
              drop:
                `DROP TABLE IF EXISTS ${table}`,
              create: `
                CREATE TABLE ${table} (
                  id      ${serial},
                  classic INTEGER,
                  year    INTEGER,
                  title   TEXT
                )`
            }
          }
        }
      });
      t.pass();
    }
  )

  test.serial( 'drop table',
    async t => {
      await db.waiter.model.albums.run('drop');
      t.pass();
    }
  )

  test.serial( 'create table',
    async t => {
      await db.waiter.model.albums.run('create');
      t.pass();
    }
  );

  test.serial( 'insert some rows',
    async t => {
      const albums = await db.waiter.model.albums.insertAll([
        { year: 1970, classic: 0, title: 'Atom Heart Mother' },
        { year: 1973, classic: 1,  title: 'The Dark Side of the Moon' },
        { year: 1975, classic: 1,  title: 'Wish You Were Here' },
        { year: 1979, classic: 1,  title: 'The Wall' },
        { year: 1983, classic: 0, title: 'The Final Cut' },
      ]);
      t.is( albums.length, 5 );
    }
  )

  test.serial( 'select rows using in',
    async t => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['in', [1973, 1975]],
      });
      t.is( albums.length, 2 );
      t.is( albums[0].title, 'The Dark Side of the Moon' );
      t.is( albums[1].title, 'Wish You Were Here' );
    }
  )

  test.serial( 'select rows using not in',
    async t => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['not in', [1973, 1975]],
      });
      t.is( albums.length, 3 );
      t.is( albums[0].title, 'Atom Heart Mother' );
      t.is( albums[1].title, 'The Wall' );
      t.is( albums[2].title, 'The Final Cut' );
    }
  )

  test.serial( 'select rows using not in and classic',
    async t => {
      const albums = await db.waiter.model.albums.allRows({
        classic: 1,
        year: ['not in', [1973, 1975]],
      });
      t.is( albums.length, 1 );
      t.is( albums[0].title, 'The Wall' );
    }
  )

  test.after( 'disconnect',
    () => db.disconnect()
  )
}