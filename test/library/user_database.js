import { expect, test } from 'vitest'
import { connect, sql } from "../../src/index.js"
import { databaseConfig } from './database.js'
import { setDebug } from '../../src/Utils/Debug.js'
import { range } from '@abw/badger-utils'
import { pass } from './expect.js'

//-----------------------------------------------------------------------------
// debugging
//-----------------------------------------------------------------------------
setDebug({
  // engine: true,
})

//-----------------------------------------------------------------------------
// Connect to database and setup tables
//-----------------------------------------------------------------------------
export async function connectUserDatabase(engine='sqlite') {
  const database = databaseConfig(engine)
  const sqlite   = engine === 'sqlite'
  const mysql    = engine === 'mysql'
  const serial   = sqlite ? 'INTEGER PRIMARY KEY ASC'  : 'SERIAL'
  const reftype  = mysql  ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER'

  const queries = {
    dropUsersTable:     'DROP TABLE IF EXISTS users',
    dropCompaniesTable: 'DROP TABLE IF EXISTS companies',
    dropEmployeesTable: 'DROP TABLE IF EXISTS employees',
    dropProductsTable:  'DROP TABLE IF EXISTS products',
    createUsersTable: `
      CREATE TABLE users (
        id        ${serial},
        name      TEXT,
        email     TEXT
        ${sqlite ? '' : ', PRIMARY KEY (id)'}
    )`,
    createCompaniesTable: `
      CREATE TABLE companies (
        id        ${serial},
        name      TEXT
        ${sqlite ? '' : ', PRIMARY KEY (id)'}
      )`,
    createEmployeesTable: `
      CREATE TABLE employees (
        id          ${serial},
        user_id     ${reftype},
        company_id  ${reftype},
        job_title   TEXT,
        ${sqlite ? '' : 'PRIMARY KEY (id),'}
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,
    createProductsTable: `
      CREATE TABLE products (
        id          ${serial},
        company_id  ${reftype},
        name        TEXT,
        ${sqlite ? '' : 'PRIMARY KEY (id),'}
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,
  };

  const tables = {
    users: {
      columns: 'id name email',
    },
    companies: {
      columns: 'id name',
    },
    employees: {
      columns: 'id user_id company_id job_title',

    },
    products: {
      columns: 'id company_id name',
    }
  };

  return connect({
    database, tables, queries
  })
}

//-----------------------------------------------------------------------------
// Run numerous tests
//-----------------------------------------------------------------------------
export const runUserDatabaseTests = async (engine, options) => {
  const postgres  = engine === 'postgres'
  const userdb    = await connectUserDatabase(engine, options)
  const users     = await userdb.table('users')
  const companies = await userdb.table('companies')
  const employees = await userdb.table('employees')
  const products  = await userdb.table('products')
  let Bobby, Brian, Franky, Felicity;
  let BadgersInc, FerretsLtd;

  test( 'drop existing tables',
    async () => {
      await userdb.run('dropProductsTable')
      await userdb.run('dropEmployeesTable')
      await userdb.run('dropCompaniesTable')
      await userdb.run('dropUsersTable')
      pass()
    }
  )

  test( 'create tables',
    async () => {
      await userdb.run('createUsersTable')
      await userdb.run('createCompaniesTable')
      await userdb.run('createEmployeesTable')
      await userdb.run('createProductsTable')
      pass()
    }
  )

  test( 'insert users',
    async () => {
      [Bobby, Brian, Franky, Felicity] = await users.insert(
        [
          { name: 'Bobby Badger',     email: 'bobby@badgerpower.com'    },
          { name: 'Brian Badger',     email: 'brian@badgerpower.com'    },
          { name: 'Franky Ferret',    email: 'franky@badgerpower.com'   },
          { name: 'Felicity Ferret',  email: 'felicity@badgerpower.com' },
        ],
        { reload: true }
      )
      expect(Bobby.id).toBe(1)
      expect(Bobby.name).toBe('Bobby Badger')
      expect(Brian.id).toBe(2)
      expect(Brian.name).toBe('Brian Badger')
      expect(Franky.id).toBe(3)
      expect(Franky.name).toBe('Franky Ferret')
      expect(Felicity.id).toBe(4)
      expect(Felicity.name).toBe('Felicity Ferret')
    }
  )

  test( 'insert companies',
    async () => {
      [BadgersInc, FerretsLtd] = await companies.insert(
        [
          { id: 100, name: 'Badgers Inc.' },
          { id: 200, name: 'Ferrets Ltd.' },
        ],
        { reload: true }
      )
      expect(BadgersInc.id).toBe(100)
      expect(BadgersInc.name).toBe('Badgers Inc.')
      expect(FerretsLtd.id).toBe(200)
      expect(FerretsLtd.name).toBe('Ferrets Ltd.')
    }
  )

  test( 'insert employees',
    async () => {
      const [a, b, c, d] = await employees.insert(
        [
          { user_id: Bobby.id,    company_id: BadgersInc.id, job_title: 'Chief Badger' },
          { user_id: Brian.id,    company_id: BadgersInc.id, job_title: 'Assistant Badger' },
          { user_id: Franky.id,   company_id: FerretsLtd.id, job_title: 'Senior Ferret' },
          { user_id: Felicity.id, company_id: FerretsLtd.id, job_title: 'Junior Ferret' },
        ],
        { reload: true }
      )
      expect(a.user_id).toBe(Bobby.id)
      expect(a.company_id).toBe(BadgersInc.id)
      expect(a.job_title).toBe('Chief Badger')
      expect(b.user_id).toBe(Brian.id)
      expect(b.company_id).toBe(BadgersInc.id)
      expect(b.job_title).toBe('Assistant Badger')
      expect(c.user_id).toBe(Franky.id)
      expect(c.company_id).toBe(FerretsLtd.id)
      expect(c.job_title).toBe('Senior Ferret')
      expect(d.user_id).toBe(Felicity.id)
      expect(d.company_id).toBe(FerretsLtd.id)
      expect(d.job_title).toBe('Junior Ferret')
    }
  )

  test( 'insert products',
    async () => {
      const nProducts = {
        100: 42,  // 42 products for BadgersInc
        200: 52   // 52 products for FerretsLtd
      }
      const productList = [BadgersInc.id, FerretsLtd.id].map(
        company_id => range(company_id, company_id + nProducts[company_id] - 1).map(
          id => ({ id, company_id, name: `Product #${id}` })
        )
      ).flat()
      await products.insert(productList, { sanitizeResult: true })
      pass()
    }
  )

  test( 'select all users',
    async () => {
      const rows = await userdb
        .select('id name email')
        .from('users')
        .all();
      expect(rows.length).toBe(4)
    }
  )

  test( 'select all users with columns',
    async () => {
      const rows = await userdb.build
        .from('users')
        .columns('id name email')
        .all()
      expect(rows.length).toBe(4)
    }
  )

  test( 'select all users with prefix',
    async () => {
      const rows = await userdb.build
        .from('users')
        .prefix('user_')
        .columns('id name email')
        .all()
      expect(rows.length).toBe(4)
      expect(rows[0].user_id).toBe(Bobby.id)
      expect(rows[0].user_name).toBe(Bobby.name)
      expect(rows[1].user_id).toBe(Brian.id)
      expect(rows[1].user_name).toBe(Brian.name)
      expect(rows[2].user_id).toBe(Franky.id)
      expect(rows[2].user_name).toBe(Franky.name)
      expect(rows[3].user_id).toBe(Felicity.id)
      expect(rows[3].user_name).toBe(Felicity.name)
    }
  )

  test( 'select one user by id',
    async () => {
      const row = await userdb
        .select('name')
        .from('users')
        .where({ id: Bobby.id })
        .one()
      expect(row.name).toBe(Bobby.name)
    }
  )

  test( 'select one user by id provided as value',
    async () => {
      const row = await userdb
        .select('name')
        .from('users')
        .where('id')
        .one([Bobby.id])
      expect(row.name).toBe(Bobby.name)
    }
  )

  test( 'select one user by id and name provided as values',
    async () => {
      const row = await userdb
        .select('name')
        .from('users')
        .where('id name')
        .one([Bobby.id, Bobby.name])
      expect(row.name).toBe(Bobby.name)
    }
  )

  test( 'select all users with id above Bobby',
    async () => {
      const rows = await userdb
        .select('name')
        .from('users')
        .where(['id', '>', Bobby.id])
        .all()
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe(Brian.name)
      expect(rows[1].name).toBe(Franky.name)
      expect(rows[2].name).toBe(Felicity.name)
    }
  )

  test( 'select all users with id above Bobby provided as value',
    async () => {
      const rows = await userdb
        .select('name')
        .from('users')
        .where({ id: ['>'] })
        .all([Bobby.id])
      expect(rows.length).toBe(3)
      expect(rows[0].name).toBe(Brian.name)
      expect(rows[1].name).toBe(Franky.name)
      expect(rows[2].name).toBe(Felicity.name)
    }
  )

  test( 'select with join onto employees',
    async () => {
      const row = await userdb
        .select('users.name, employees.job_title')
        .from('users')
        .join('users.id=employees.user_id')
        .where({ 'users.id': Bobby.id })
        .one()
      expect(row.name).toBe(Bobby.name)
      expect(row.job_title).toBe('Chief Badger')
    }
  )

  test( 'select with join onto employees and company',
    async () => {
      const row = await userdb
        .select('users.name, employees.job_title')
        .select(['companies.name', 'company_name'])
        .from('users')
        .join('users.id=employees.user_id')
        .join('employees.company_id=companies.id')
        .where('users.id')
        .one([Bobby.id])
      expect(row.name).toBe(Bobby.name)
      expect(row.job_title).toBe('Chief Badger')
      expect(row.company_name).toBe('Badgers Inc.')
    }
  )

  test( 'select with queries built on a base',
    async () => {
      const employees = userdb
        .select(
          'users.name employees.job_title',
          ['companies.name', 'company_name']  // alias company.name to company_name
        )
        .from('users')
        .join('users.id=employees.user_id')
        .join('employees.company_id=companies.id')

      // fetch a single row by user id
      const row = await employees
        .where('users.id')
        .one([Bobby.id])
      expect(row.name).toBe(Bobby.name)
      expect(row.job_title).toBe('Chief Badger')
      expect(row.company_name).toBe('Badgers Inc.')

      // fetch all employees of a company
      const rows = await employees
        .where('companies.id')
        .all([BadgersInc.id])
      expect(rows.length).toBe(2)
      expect(rows[0].name).toBe(Bobby.name)
      expect(rows[0].job_title).toBe('Chief Badger')
      expect(rows[0].company_name).toBe('Badgers Inc.')
      expect(rows[1].name).toBe(Brian.name)
      expect(rows[1].job_title).toBe('Assistant Badger')
      expect(rows[1].company_name).toBe('Badgers Inc.')

      const badger = await employees
        .select('users.id')
        .where('employees.job_title')
        .one(['Chief Badger'])
      expect(badger.id).toBe(Bobby.id)
      expect(badger.name).toBe(Bobby.name)
      expect(badger.job_title).toBe('Chief Badger')
      expect(badger.company_name).toBe('Badgers Inc.')
    }
  )

  test( 'select range of products for a company',
    async () => {
      const rows = await userdb
        .select('id name')
        .from('products')
        .where({ company_id: BadgersInc.id })
        .range(10, 19)
        .all();
      expect(rows.length).toBe(10)
      expect(rows[0].name).toBe(`Product #110`)
      expect(rows[9].name).toBe(`Product #119`)
    }
  );

  test( 'count products by company',
    async () => {
      const rows = await userdb
        .select('companies.id companies.name', sql`COUNT(products.id) AS n_products`)
        .from('companies')
        .join('companies.id=products.company_id')
        .group('companies.id')
        .order('companies.id')
        .all()
      expect(rows.length).toBe(2)
      expect(rows[0].id).toBe(100)
      expect(rows[0].name).toBe('Badgers Inc.')
      expect(parseInt(rows[0].n_products)).toBe(42)
      expect(rows[1].id).toBe(200)
      expect(rows[1].name).toBe('Ferrets Ltd.')
      expect(parseInt(rows[1].n_products)).toBe(52)
    }
  );

  test( 'count products by company having > 50 products',
    async () => {
      const rows = await userdb
        .select('companies.id companies.name', sql`COUNT(products.id) AS n_products`)
        .from('companies')
        .join('companies.id=products.company_id')
        .group('companies.id')
        .order('companies.id')
        .having(
          postgres
            ? [ sql`COUNT(products.id)`, '>', undefined]
            : [ 'n_products', '>', undefined ]
        )
        .all([50])
      expect(rows.length).toBe(1)
      expect(rows[0].id).toBe(200)
      expect(rows[0].name).toBe('Ferrets Ltd.')
      expect(parseInt(rows[0].n_products)).toBe(52)
    }
  );

  test( 'disconnect',
    async () => {
      await userdb.run('dropProductsTable')
      await userdb.run('dropEmployeesTable')
      await userdb.run('dropCompaniesTable')
      await userdb.run('dropUsersTable')
      userdb.disconnect();
      pass()
    }
  )
}