import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host:     'localhost',
    database: 'test',
    user:     'test',
    password: 'test'
  });
  // console.log('connection: ', connection);
  const drop = await connection.query(
    `DROP TABLE IF EXISTS user`
  );
  console.log('drop table result: ', drop);
  const create = await connection.query(
    `CREATE TABLE user (
      id              SERIAL,
      name            VARCHAR(64)     NOT NULL,
      email           VARCHAR(64)     NOT NULL,
      registered      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE INDEX    user_email_index (email)
    )`
  );
  console.log('create table result: ', create);
  const insert = await connection.prepare(
    `INSERT INTO user (name, email) VALUES (?, ?)`
  )
  console.log('insert result: ', insert);
  const i1 = await insert.execute(['Bobby Badger', 'bobby@badgerpower.com']);
  console.log('insert1 result: ', i1);
  const i2 = await insert.execute(['Brian Badger', 'brian@badgerpower.com']);
  console.log('insert2 result: ', i2);
  const bobby = await connection.execute('SELECT * FROM user WHERE email="bobby@badgerpower.com"');
  console.log('bobby result: ', bobby);
  await connection.end();
}

main();
