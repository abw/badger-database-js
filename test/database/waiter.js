import test from 'ava';
import { connect } from '../../src/Database.js';
import { connectMusicDatabase } from '../library/music_database.js';

let musicdb;

test.before(
  async t => {
    musicdb = await connectMusicDatabase();
    await musicdb.run('createArtistsTable');
    t.pass("connected to music database")
  }
);

test.serial(
  'record insert and update',
  async t => {
    const artists = await musicdb.table('artists');
    const record = await artists.insertOneRecord({
      name: 'The Pink Floyd'
    });
    await record.update({
      name: 'Pink Floyd'
    });
    t.is(record.name, 'Pink Floyd');
    await record.delete();
  }
)

test.serial(
  'chained record insert and update',
  async t => {
    const name = await musicdb
      .waiter
      .model
      .artists
      .insertOneRecord({
        name: 'The Pink Floyd'
      })
      .update({
        name: 'Pink Floyd'
      })
      .name;
    t.is(name, 'Pink Floyd');
  }
)

test.serial(
  'waiter connect',
  async t => {
    const row = await connect({ database: 'sqlite:memory' })
      .waiter
      .one("SELECT 'Hello World!' AS greeting")
    t.is(row.greeting, 'Hello World!');
  }
)

test.after(
  () => musicdb.disconnect()
)