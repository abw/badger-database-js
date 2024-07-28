import { expect, test } from 'vitest'
import { connect } from "../../../src/Database.js"
import { databaseConfig } from '../../library/database.js'
import { pass } from '../../library/expect.js'

const database = databaseConfig('mysql')

const tables = {
  animals: {
    columns: 'id:readonly info changes',
    queries: {
      drop:  'DROP TABLE IF EXISTS animals',
      create: `
        CREATE TABLE animals (
          id        SERIAL,
          info      JSON,
          changes   JSON
        )
      `
    }
  }
}

let db;
let table;
let id;

test( 'connect',
  async () => {
    db = connect({
      database,
      tables
    })
    table = await db.table('animals')
    expect(table).toBeTruthy()
  }
)

test( 'drop table',
  async () => {
    await table.run('drop')
    pass()
  }
)

test( 'create table',
  async () => {
    await table.run('create')
    pass();
  }
);

test( 'insert',
  async () => {
    const row = await table.insertOneRow({
      info: { name: 'Badger' },
      changes: [ { action: 'created' } ]
    })
    id = row.id;
    expect(row.info.name).toBe('Badger')
    expect(row.changes[0].action).toBe('created')
  }
)

test( 'update',
  async () => {
    const record = await table.fetchOneRecord({ id });
    await record.update({
      info: { name: 'Mr Badger' },
      changes: [ ...record.row.changes, { action: 'updated' } ]
    })
    expect(record.row.info.name).toBe('Mr Badger')
    expect(record.row.changes[0].action).toBe('created')
    expect(record.row.changes[1].action).toBe('updated')
    expect(record.row.info.name).toBe('Mr Badger')
  }
)

test( 'disconnect',
  () => db.disconnect()
)