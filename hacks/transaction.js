import { connect } from '../src/index.js';
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
  //const row = await db.one("SELECT 'hello' AS message");
  //console.log('row:', row);
  await db.transaction(
    async db => {
      console.log('db:', db.tmpId());
      const row = await db.one("SELECT 'hello' AS message");
      console.log('row:', row);
      const users = await db.table('users');
      const user = await users.insertRecord({
        name: 'Brian Badger',
        email: 'brian@badgerpower.com',
      })
      console.log('inserted user: ', user.row);
      await user.update({ name: 'Brian the Badger' })

    }
  )
  db.disconnect();
}

main()
