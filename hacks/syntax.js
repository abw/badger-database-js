import { connect } from '../src/index.js';

async function main() {
  const db = connect({
    // database: 'sqlite:memory',
    // database: 'mysql://test:test@localhost/test',
    database: 'postgres://test:test@localhost/test',
  })
  await db.run(
    `CREATE TABLE parp (
      id ERROR,
    )`
  ).catch(
    e => console.log('OOPS: ', e)
  )
  db.disconnect();
}

main()

