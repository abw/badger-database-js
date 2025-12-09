import { expect, test } from 'vitest'
import Database from '../../src/Builder/Database.js'
import From from '../../src/Builder/From.js'
import Select from '../../src/Builder/Select.js'
import Insert from '../../src/Builder/Insert.js'
import Update from '../../src/Builder/Update.js'
import Delete from '../../src/Builder/Delete.js'
import { connect } from '../../src/Database.js'
import { DatabaseInstance } from '@/src/types'

let db: DatabaseInstance

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'builder',
  () => expect(
    db.build
  ).toBeInstanceOf(
    Database
  )
)

test( 'from',
  () => expect(
    db.build.from('tablename')
  ).toBeInstanceOf(
    From
  )
)

test( 'select',
  () => expect(
    db.select('columns')
  ).toBeInstanceOf(
    Select
  )
)

test( 'insert',
  () => expect(
    db.insert()
  ).toBeInstanceOf(
    Insert
  )
)

test( 'update',
  () => expect(
    db.update()
  ).toBeInstanceOf(
    Update
  )
)

test( 'delete',
  () => expect(
    db.delete()
  ).toBeInstanceOf(
    Delete
  )
)

test( 'delete',
  () => expect(
    db.select('id name email')
      .from('users')
      .where('id')
      .sql()
  ).toBe(
    [
      'SELECT "id", "name", "email"',
      'FROM "users"',
      'WHERE "id" = ?'
    ].join('\n')
  )
)


test( 'disconnect',
  () => db.disconnect()
)
