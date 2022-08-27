import Config from '../../src/Config.js';
import Database from '../../src/Database.js';

export const database = new Database({
  ...Config,
  tables: {
    users: {
      table: 'user',
      columns: [
        'id', 'forename', 'surname', 'email', 'password', 'is_admin',
      ],
    }
  }
});
export const users = database.table('users');
