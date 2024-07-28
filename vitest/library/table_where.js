import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { serialTypeFragment } from './users_table.js'
import { pass } from './expect.js'

export function runTableWhereTests(engine) {
  const database = databaseConfig(engine);
  const serial = serialTypeFragment(engine);
  // we can't use the 'albums' table here because foreign key constraints
  // will fail when we try to drop it
  const table = 'where_albums';
  let db;

  test( 'connect',
    () => {
      db = connect({
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
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      await db.waiter.model.albums.run('drop')
      pass()
    }
  )

  test( 'create table',
    async () => {
      await db.waiter.model.albums.run('create')
      pass()
    }
  );

  test( 'insert some rows',
    async () => {
      const albums = await db.waiter.model.albums.insertAll([
        { year: 1970, title: 'Atom Heart Mother' },
        { year: 1973, title: 'The Dark Side of the Moon' },
        { year: 1975, title: 'Wish You Were Here' },
        { year: 1979, title: 'The Wall' },
        { year: 1983, title: 'The Final Cut' },
      ])
      expect(albums.length).toBe(5)
    }
  )

  test( 'select a row',
    async () => {
      const albums = await db.waiter.model.albums.allRows({
        year: 1973,
      })
      expect(albums.length).toBe(1)
      expect(albums[0].title).toBe('The Dark Side of the Moon')
    }
  )

  test( 'select a series of rows',
    async () => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['>', 1973],
      })
      expect(albums.length).toBe(3)
      expect(albums[0].title).toBe('Wish You Were Here')
      expect(albums[1].title).toBe('The Wall')
      expect(albums[2].title).toBe('The Final Cut')
    }
  )

  test( 'select rows using in',
    async () => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['in', [1973, 1975]],
      })
      expect(albums.length).toBe(2)
      expect(albums[0].title).toBe('The Dark Side of the Moon')
      expect(albums[1].title).toBe('Wish You Were Here')
    }
  )

  test( 'select rows using not in',
    async () => {
      const albums = await db.waiter.model.albums.allRows({
        year: ['not in', [1973, 1975]],
      })
      expect(albums.length).toBe(3)
      expect(albums[0].title).toBe('Atom Heart Mother')
      expect(albums[1].title).toBe('The Wall')
      expect(albums[2].title).toBe('The Final Cut')
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}