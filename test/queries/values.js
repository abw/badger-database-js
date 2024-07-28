import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;

test( 'connect',
  () => {
    db = connect({
      database: 'sqlite:memory',
      queries: {
        selectBobby:
          db => db.select('*').from('user').where({ name: 'Bobby Badger' }),
      }
    });
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'all() first time',
  async () => {
    const query = await db.query('selectBobby');
    expect(query.allValues()).toStrictEqual(['Bobby Badger'])
  }
)

test( 'all() second time',
  async () => {
    const query = await db.query('selectBobby');
    expect(query.allValues()).toStrictEqual(['Bobby Badger'])
  }
)

test( 'all() third time',
  async () => {
    const query = await db.query('selectBobby')
    expect(query.allValues()).toStrictEqual(['Bobby Badger'])
  }
)

test( 'disconnect',
  () => db.disconnect()
)