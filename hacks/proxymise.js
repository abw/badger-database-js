import { connect } from '../src/Database.js';
import proxymise from 'proxymise';

async function main() {
  const db = await connect({
    database: 'sqlite:memory',
    tables: {
      users: {
        columns: 'id name email'
      }
    }
  });
  await db.run(`
    CREATE TABLE users (
      id    INTEGER PRIMARY KEY ASC,
      name  TEXT,
      email TEXT
    )`
  );
  const users = await db.table("users");
  const record = await users.insertOneRecord({
    name: 'Bobby Badger',
    email: 'bobby@badgerpower.com'
  });
  await record.update({
    name: 'Robert Badger'
  });
  console.log('name: ', record.name);

  const name2 = await proxymise(db)
    .model.users.oneRecord({
      email: 'bobby@badgerpower.com'
    })
    .update({
      name: 'Brian T Badger'
    })
    .name;
  console.log('name2: ', name2);

  const name3 = await db.waiter
    .model.users.oneRecord({
      email: 'bobby@badgerpower.com'
    })
    .update({
      name: 'Brian The Badger'
    })
    .name;
  console.log('name3: ', name3);

  await db.disconnect();

}

main();