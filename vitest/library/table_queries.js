import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { databaseConfig } from './database.js'
import { createUsersTableQuery } from './users_table.js'
import { pass } from './expect.js'

export function runTableQueriesTests(engine) {
  const database = databaseConfig(engine);
  const create = createUsersTableQuery(engine);
  const placeholder = engine === 'postgres' ? '$1' : '?';
  let db;

  test( 'connect',
    () => {
      db = connect({
        database,
        tables: {
          users: {
            columns: 'id:readonly name:required email:required animal',
            fragments: {
              select:
                'SELECT <columns> FROM <table>'
            },
            queries: {
              dropTable:
                'DROP TABLE IF EXISTS <table>',
              createTable:
                create,
              selectByName:
                `<select> WHERE name=${placeholder}`,
              selectByEmail:
                `<select> WHERE email=${placeholder}`,
              allBadgers:
                table => table.select().where({ animal: 'Badger' })
            }
          }
        }
      })
      pass()
    }
  )

  test( 'drop table',
    async () => {
      const users = await db.table('users')
      await users.run('dropTable')
      pass()
    }
  )

  test( 'create table',
    async () => {
      const users = await db.table('users')
      await users.run('createTable')
      pass()
    }
  );

  test( 'insert a row',
    async () => {
      const users = await db.table('users')
      const result = await users.insert({
        name:   'Bobby Badger',
        email:  'bobby@badgerpower.com',
        animal: 'Badger'
      })
      expect(result.id).toBe(1)
      expect(result.changes).toBe(1)
    }
  )

  test( 'fetch one row',
    async () => {
      const users = await db.table('users')
      const bobby = await users.one(
        'selectByName',
        ['Bobby Badger']
      ).catch(
        e => console.log('one() failed: ', e)
      )
      expect(bobby.id).toBe(1)
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'fetch any row',
    async () => {
      const users = await db.table('users')
      const bobby = await users.any(
        'selectByName',
        ['Bobby Badger']
      )
      expect(bobby.id).toBe(1)
      expect(bobby.name).toBe('Bobby Badger')
      expect(bobby.email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'fetch all rows',
    async () => {
      const users = await db.table('users')
      const bobbies = await users.all(
        'selectByName',
        ['Bobby Badger']
      )
      expect(bobbies.length).toBe(1)
      expect(bobbies[0].id).toBe(1)
      expect(bobbies[0].name).toBe('Bobby Badger')
      expect(bobbies[0].email).toBe('bobby@badgerpower.com')
    }
  )

  test( 'fetch all badgers once',
    async () => {
      const users = await db.table('users')
      const values = users.query('allBadgers').allValues()
      expect(values).toStrictEqual(['Badger'])
    }
  )

  test( 'fetch all badgers twice',
    async () => {
      const users = await db.table('users');
      const values = users.query('allBadgers').allValues();
      expect(values).toStrictEqual(['Badger'])
    }
  )

  test( 'inspect fetch',
    async () => {
      const users = await db.table('users');
      const values = users.select().allValues();
      expect(values).toStrictEqual([])
    }
  )

  test( 'disconnect',
    () => db.disconnect()
  )
}