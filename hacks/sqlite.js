import Database from 'better-sqlite3';

const db = new Database(':memory:', { verbose: console.log });
// const db = new Database('foo.db', { verbose: console.log });
const done = db.exec("CREATE TABLE user (id INTEGER PRIMARY KEY ASC, name TEXT, email TEXT)");
const newUser = db.prepare('INSERT INTO user (name, email) VALUES (?, ?)');
const inserted = newUser.run('Andy Wardley', 'abw@wardley.org');
console.log('inserted: ', inserted);
const getUserByEmail = db.prepare('SELECT * FROM user where email=?');
const abw = getUserByEmail.get('abw@wardley.org');
console.log('selected: ', abw);


const db2 = new Database(':memory:', { verbose: console.log });
// const db2 = new Database('foo.db', { verbose: console.log });
const getUserByEmail2 = db2.prepare('SELECT * FROM user where email=?');
const abw2 = getUserByEmail2.get('abw@wardley.org');
console.log('selected: ', abw2);
