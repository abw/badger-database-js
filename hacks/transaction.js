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
  console.log('db [%s] is proxy?', db.tmpId(), db.isProxy ? red('YES') : green('NO'))

  const row = await db.one("SELECT 'hello' AS message");
  console.log('row:', row);

  const users = await db.table('users');
  console.log('users table db [%s] is proxy?', users.database.tmpId(), users.database.isProxy ? red('YES') : green('NO'))

  console.log('\nstarting transaction');

  await db.transaction(
    async db => {
      console.log('transaction db (%s) is proxy?', db.tmpId(), db.isProxy ? green('YES') : red('NO'))

      const row = await db.one("SELECT 'hello' AS message");
      console.log('transaction row:', row);

      // const r2 = await db.build.select({ sql: "'hello' AS message"}).any();
      // console.log('transaction row2:', r2);
      const users = await db.table('users');
      console.log('transaction db [%s] is proxy?', users.database.tmpId(), users.database.isProxy ? green('YES') : red('NO'))

      const user = await users.insertRecord({
        name: 'Brian Badger',
        email: 'brian@badgerpower.com',
      })
      console.log('inserted user: ', user.row);
      await user.update({ name: 'Brian the Badger' })

      const get = await db.select('id name email').from('users').one();
      console.log('fetched user: ', get);

    }
  )
  db.disconnect();
}

main()
