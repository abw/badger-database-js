import connect, { sql } from "../src/index.js"

async function main() {
  const db = await connect({ database: 'sqlite:memory' });
  console.log(
    db
      .from('users companies')
      .select({ table: 'users',     columns: 'id email'})
      .select({ table: 'companies', column: 'name' })
      // .from('users')
      // .select('name email')
      // .where('id')
      // .join({ table: 'companies', from: 'company_id', to: 'id' })
      // .select({ column: 'name', as: 'company_name' })

      //.from('users')
      //.select('users.name email')
      //.where('users.id')
      //.from('companies')
      //.select({ column: 'name', as: 'company_name' })
      //.where(sql`users.company_id=companies.id`)
      .sql()
  );

}
main();