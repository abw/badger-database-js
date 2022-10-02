import { runMusicDatabaseTests } from '../../library/music_database.js';

runMusicDatabaseTests(
  'sqlite:memory',
  { sqlite: true }
)
