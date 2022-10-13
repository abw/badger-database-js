// This example shows the use of records, including a custom user record class
import { connect, Record } from '@abw/badger-database';

export class User extends Record {
  hello() {
    return 'Hello ' + this.row.name;
  }
}

async function main() {
  const db = connect({
    database: 'sqlite:memory',
    tables: {
      users: {
        // bind in the custom record class
        recordClass: User,
        // column definitions
        columns: 'id name email animal',
        // query definitions
        queries: {
          create: `
            CREATE TABLE users (
              id     INTEGER PRIMARY KEY ASC,
              name   TEXT,
              email  TEXT,
              animal TEXT
            )`
        }
      },
    }
  });

  // fetch users table object
  const users = await db.table('users');

  // run the 'create' query to create the database table
  await users.run('create');

  // insert a row
  await users.insert({
    name:   'Bobby Badger',
    email:  'bobby@badgerpower.com',
    animal: 'Badger'
  });

  // fetch a record
  const user = await users.oneRecord({
    email: 'bobby@badgerpower.com'
  })

  // now call the custom hello() method on the record
  console.log(user.hello());    // Hello Bobby Badger

  // update the record
  await user.update({
    name: 'Robert Badger',
  })

  // call the custom hello() method again
  console.log(user.hello());    // Hello Robert Badger

  // delete the record
  await user.delete();

  // cleanup
  db.disconnect();
}

main()