import { connect } from '../src/index.js';

async function main() {
  const db = connect({
    // database: 'sqlite:memory',
    // database: 'mysql://test:test@localhost/test',
    database: 'maria://test:test@localhost/test',
    // database: 'postgres://test:test@localhost/test',
  })
  await db.run(
    `SELECT FROM badger mushroom`
  ).catch(
    e => console.log(e)
  )
  db.disconnect();
}

main()

