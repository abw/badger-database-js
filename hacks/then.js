import { connect } from '../src/Database.js';

connect({ database: 'sqlite:memory' }).then(
  db => {
    db.run(
      `CREATE TABLE users (
        id    INTEGER PRIMARY KEY ASC,
        name  TEXT,
        email TEXT
      )`
    ).then(
      () => db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Bobby Badger', 'bobby@badgerpower.com']
      )
    ).then(
      insert => console.log("Inserted ID:", insert.lastInsertRowid)
    ).then(
      () => db.one(
        'SELECT * FROM users WHERE email=?',
        ['bobby@badgerpower.com']
      )
    ).then(
      bobby => console.log("Fetched row:", bobby)
    ).then(
      () => db.disconnect()
    )
  }
);
