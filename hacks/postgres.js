import pg from 'pg';
// console.log('pg: ', pg);
const { Client } = pg;


//await client.end()

async function main() {
  const pool = new pg.Client({
    user: 'test',
    host: 'localhost',
    database: 'test',
    password: 'test',
  })
  await pool.connect();
  // console.log('connection: ', connection);
  const drop = await pool.query(
    `DROP TABLE IF EXISTS users`
  );
  console.log('drop table result: ', drop);
  const create = await pool.query(
    `CREATE TABLE users (
      id              SERIAL,
      name            VARCHAR(64)     NOT NULL,
      email           VARCHAR(64)     NOT NULL,
      registered      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE          (email)
    )`
  );
  console.log('create table result: ', create);

  const insert = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id';
  const i1 = await pool.query(insert, ['Bobby Badger', 'bobby@badgerpower.com']);
  console.log('insert1 result: ', i1);

  const i2 = await pool.query(insert, ['Brian Badger', 'brian@badgerpower.com']);
  console.log('insert2 result: ', i2);

  const bobby = await pool.query('SELECT * FROM users WHERE email=$1', ["bobby@badgerpower.com"]);
  console.log('bobby result: ', bobby);
  // */
  await pool.end();
}

main();
