import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'
import { SQLParseError, UnexpectedRowCount } from '../../src/Utils/Error.js'
import { connectMusicDatabase } from '../library/music_database.js'
import { expectToThrowAsyncErrorTypeMessage, pass } from '../library/expect.js';

let musicdb;

test( 'connect',
  async () => {
    musicdb = await connectMusicDatabase();
    await musicdb.run('createArtistsTable');
    pass("connected to music database")
  }
);

test( 'record insert and update',
  async () => {
    const artists = await musicdb.table('artists');
    const record = await artists.insertOneRecord({
      name: 'The Pink Floyd'
    });
    await record.update({
      name: 'Pink Floyd'
    });
    expect(record.name).toBe('Pink Floyd')
    await record.delete();
  }
)

test( 'chained record insert and update',
  async () => {
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
    expect(name).toBe('Pink Floyd')
  }
)

test( 'waiter connect',
  async () => {
    const row = await connect({ database: 'sqlite:memory' })
      .waiter
      .one("SELECT 'Hello World!' AS greeting")
    expect(row.greeting).toBe('Hello World!')
  }
)

test( 'waiter syntax error',
  async () => await expect(
    () => musicdb
      .waiter
      .model
      .artists
      .one('SELECT pink floyd'),
  ).rejects.toThrowError(
    SQLParseError
  )
)

test( 'waiter missing record error',
  () => expectToThrowAsyncErrorTypeMessage(
    async () => await musicdb
      .waiter
      .model
      .artists
      .fetchOne({ name: 'Punk Floyd' }),
    UnexpectedRowCount,
    '0 rows were returned when one was expected'
  )
)

test( 'disconnect',
  () => musicdb.disconnect()
)