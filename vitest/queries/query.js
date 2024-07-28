import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { setDebug } from '../../src/Utils/Debug.js'

let db;

setDebug({
  // queries: true,
  // query: true,
  // engine: true,
})

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      fragments: {
        world: 'World',
      },
      queries: {
        hello: 'Hello <world>!',
        create: `
          CREATE TABLE user (
            id INTEGER PRIMARY KEY ASC,
            name TEXT,
            email TEXT
          )`,
        insert:
          'INSERT INTO user (name, email) VALUES (?, ?)',
        selectAll:
          'SELECT * FROM user',
        selectEmail:
          'SELECT * FROM user WHERE email=?',
        select:
          db => db.select('*').from('user'),
        selectBobby:
          db => db.select('*').from('user').where({ name: 'Bobby Badger' }),
        selectByName:
          db => db.query('select').where('name'),
        selectByEmail:
          db => db.query('select').where('email'),
      }
    });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'hello query',
  () => {
    const hello = db.query('hello')
    expect(hello).toBe('Hello <world>!')
  }
)

test( 'build hello query',
  () => {
    const query = db.buildQuery('hello')
    expect(query.query).toBe('Hello World!')
    expect(query.sql()).toBe('Hello World!')
  }
)

test( 'create',
  async () => {
    const query = db.buildQuery('create')
    const create = await query.run()
    expect(create.changes).toBe(0)
  }
)

test( 'insert a row',
  async () => {
    const query = db.buildQuery('insert');
    const insert = await query.run(
      ['Bobby Badger', 'bobby@badgerpower.com']
    );
    expect(insert.changes).toBe(1)
  }
)

test( 'insert a row with whereValues',
  async () => {
    const query = db.buildQuery('insert', { whereValues: ['Brian Badger'] })
    const values = query.allValues(['brian@badgerpower.com'])
    expect(values).toStrictEqual(['Brian Badger', 'brian@badgerpower.com'])
    const insert = await query.run(['brian@badgerpower.com'])
    expect(insert.changes).toBe(1)
  }
)

test( 'fetch any row',
  async () => {
    const bobby = await db.buildQuery('selectEmail').any(
      ['bobby@badgerpower.com']
    )
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'fetch one row',
  async () => {
    const brian = await db.buildQuery('selectEmail').one(
      ['brian@badgerpower.com']
    )
    expect(brian.name).toBe('Brian Badger')
  }
)

test( 'fetch all rows',
  async () => {
    const badgers = await db.buildQuery('selectAll').all()
    expect(badgers.length).toBe(2)
    expect(badgers[0].name).toBe('Bobby Badger')
    expect(badgers[1].name).toBe('Brian Badger')
  }
)

test( 'select query builder',
  async () => {
    const query = db.buildQuery('select')
    expect(query.sql()).toBe('SELECT *\nFROM "user"' )
    const badgers = await query.all()
    expect(badgers.length).toBe(2)
  }
)

test( 'selectBobby query',
  async () => {
    const query = db.buildQuery('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?' )
    const bobby = await query.any()
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectBobby query values',
  async () => {
    const query = db.query('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?' )
    const values = query.allValues()
    expect(values).toStrictEqual(['Bobby Badger'])
  }
)

test( 'selectBobby query values with more',
  async () => {
    const query = db.query('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?')
    const values = query.allValues(['foo'])
    expect(values).toStrictEqual(['Bobby Badger', 'foo'])
  }
)

test( 'selectBobby query values with function',
  async () => {
    const query = db.query('selectBobby').having({ y: 99 })
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?\nHAVING "y" = ?' )
    const values = query.allValues((s, w, h) => [...s, 'foo', ...w, 'bar', ...h])
    expect(values).toStrictEqual(['foo', 'Bobby Badger', 'bar', 99])
  }
)

test( 'selectBobby query allValues',
  async () => {
    const query = db.query('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?' )
    const values = query.allValues()
    expect(values).toStrictEqual(['Bobby Badger'])
  }
)

test( 'selectBobby query whereValues',
  async () => {
    const query = db.query('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?' )
    const values = query.whereValues()
    expect(values).toStrictEqual(['Bobby Badger'])
  }
)

test( 'selectBobby query havingValues',
  async () => {
    const query = db.query('selectBobby')
    expect(query.sql()).toBe('SELECT *\nFROM "user"\nWHERE "name" = ?' )
    const values = query.havingValues()
    expect(values).toStrictEqual([])
  }
)

test( 'selectBobby one',
  async () => {
    const bobby = await db.one('selectBobby')
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectBobby any',
  async () => {
    const bobby = await db.any('selectBobby')
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectBobby all',
  async () => {
    const rows = await db.all('selectBobby')
    expect(rows.length).toBe(1)
    expect(rows[0].name).toBe('Bobby Badger')
  }
)

test( 'selectByName one',
  async () => {
    const bobby = await db.one('selectByName', ['Bobby Badger'])
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectByEmail one',
  async () => {
    const bobby = await db.one('selectByEmail', ['bobby@badgerpower.com'])
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectByName any',
  async () => {
    const bobby = await db.any('selectByName', ['Bobby Badger'])
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectByEmail any',
  async () => {
    const bobby = await db.any('selectByEmail', ['bobby@badgerpower.com'])
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'selectByName all',
  async () => {
    const rows = await db.all('selectByName', ['Bobby Badger'])
    expect(rows.length).toBe(1)
    expect(rows[0].name).toBe('Bobby Badger')
  }
)

test( 'selectByEmail all',
  async () => {
    const rows = await db.all('selectByEmail', ['bobby@badgerpower.com'])
    expect(rows.length).toBe(1)
    expect(rows[0].name).toBe('Bobby Badger')
  }
)

test( 'extended select query builder',
  async () => {
    const bobby = await db.query('select').where({ name: 'Bobby Badger' }).one()
    expect(bobby.name).toBe('Bobby Badger')
  }
)

test( 'disconnect',
  () => db.disconnect()
)