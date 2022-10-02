import { runMusicDatabaseTests } from '../../library/music_database.js';
import { database } from '../../library/postgres.js';

runMusicDatabaseTests(
  database,
  { postgres: true }
)
