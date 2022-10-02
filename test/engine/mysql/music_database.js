import { runMusicDatabaseTests } from '../../library/music_database.js';
import { database } from '../../library/mysql.js';

runMusicDatabaseTests(
  database,
  { mysql: true }
)
