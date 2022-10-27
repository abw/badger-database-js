import { connect, green, red } from '../src/index.js';
import { createUsersTableQuery } from '../test/library/users_table.js';

async function main() {
  const db = connect({
    database: 'sqlite:memory',
    queries: {
      createUsers: createUsersTableQuery('sqlite')
    },
    tables: {
      users: {
        columns: 'id name email animal friends'
      }
    }
  });

  await db.run('createUsers');

  await db.transaction(
    async (db, commit, rollback) => {
      console.log('going wobbly');
      await db.run('SELECT badger ferret')
      console.log('went wobbly');

      // throw "Oh my lordy!"
      //commit();
      //rollback();
    },
    // { debug: true }
    { autoCommit: true, debug: true }
    // { autoRollback: false, debug: true }
  )
  db.disconnect();
}

main()
