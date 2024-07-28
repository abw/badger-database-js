import { expect, test } from 'vitest'
import { Albums, Artists, connectMusicDatabase } from '../library/music_database.js'

let musicdb;

test( 'connect',
  async () => {
    musicdb = await connectMusicDatabase();
    expect(musicdb).toBeTruthy()
  }
);

test( 'model.artists',
  async () => {
    const artists = await musicdb.model.artists;
    expect(artists).toBeInstanceOf(Artists)
  }
)

test( 'model.albums',
  async () => {
    const model = musicdb.model;
    const albums = await model.albums;
    expect(albums).toBeInstanceOf(Albums)
  }
)

test( 'model.missing_table',
  async () => {
    await expect(
      () => musicdb.model.missing_table
    ).rejects.toThrowError(
      'Invalid table specified: missing_table'
    )
  }
)

test( 'disconnect',
  () => musicdb.disconnect()
)