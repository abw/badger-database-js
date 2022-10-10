import connect, { sql } from "../src/index.js"

async function main() {
  const db = await connect({ database: 'sqlite:memory' });
  console.log(
    db
      .from('users')
      .select('users.name email')
      .where('users.id')
      .from('companies')
      .select({ column: 'name', as: 'company_name' })
      .where(sql`users.company_id=companies.id`)
      .sql()
  );

}
main();