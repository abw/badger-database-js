import { connect } from "../src/index.js"

async function main() {
  const db = await connect({ database: 'sqlite:memory' });
  console.log(
    db
      .select('name email')
      .from('users')
      .where(['id', '>', 12345])
      .where('name')
      //.from('users')
      //.select('name email')
      //.where('id')
      .sql()
  );

}
main();