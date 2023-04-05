import test from 'ava';
import { connect } from "../../../src/Database.js";
import { databaseConfig } from '../../library/database.js';

const database = databaseConfig('mysql');

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

test.serial( 'connect',
  async t => {
    db = connect({
      database,
      tables
    })
    table = await db.table('animals')
    t.pass();
  }
)

test.serial( 'drop table',
  async t => {
    await table.run('drop');
    t.pass();
  }
)

test.serial( 'create table',
  async t => {
    await table.run('create');
    t.pass();
  }
);

test.serial( 'insert',
  async t => {
    const row = await table.insertOneRow({
      info: { name: 'Badger' },
      changes: [ { action: 'created' } ]
    })
    id = row.id;
    t.is( row.info.name, 'Badger' );
    t.is( row.changes[0].action, 'created' );
  }
)

test.serial( 'update',
  async t => {
    const record = await table.fetchOneRecord({ id });
    await record.update({
      info: { name: 'Mr Badger' },
      changes: [ ...record.row.changes, { action: 'updated' } ]
    })
    t.is( record.row.info.name, 'Mr Badger' );
    t.is( record.row.changes[0].action, 'created' );
    t.is( record.row.changes[1].action, 'updated' );
    t.is( record.row.info.name, 'Mr Badger' );
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)