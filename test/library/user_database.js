import test from 'ava';
import { connect, sql } from "../../src/index.js";
import { databaseConfig } from './database.js';
import { setDebug } from '../../src/Utils/Debug.js';
import { range } from '@abw/badger-utils';

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
  const database = databaseConfig(engine);
  const sqlite   = engine === 'sqlite';
  const mysql    = engine === 'mysql';
  const serial   = sqlite ? 'INTEGER PRIMARY KEY ASC'  : 'SERIAL';
  const reftype  = mysql  ? 'BIGINT UNSIGNED NOT NULL' : 'INTEGER';

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
  });
}

//-----------------------------------------------------------------------------
// Run numerous tests
//-----------------------------------------------------------------------------
export const runUserDatabaseTests = async (engine, options) => {
  const postgres  = engine === 'postgres';
  const userdb    = await connectUserDatabase(engine, options);
  const users     = await userdb.table('users');
  const companies = await userdb.table('companies');
  const employees = await userdb.table('employees');
  const products  = await userdb.table('products');
  let Bobby, Brian, Franky, Felicity;
  let BadgersInc, FerretsLtd;

  test.serial(
    'drop existing tables',
    async t => {
      await userdb.run('dropProductsTable');
      await userdb.run('dropEmployeesTable');
      await userdb.run('dropCompaniesTable');
      await userdb.run('dropUsersTable');
      t.pass();
    }
  )

  test.serial(
    'create tables',
    async t => {
      await userdb.run('createUsersTable');
      await userdb.run('createCompaniesTable');
      await userdb.run('createEmployeesTable');
      await userdb.run('createProductsTable');
      t.pass();
    }
  )

  test.serial(
    'insert users',
    async t => {
      [Bobby, Brian, Franky, Felicity] = await users.insert(
        [
          { name: 'Bobby Badger',     email: 'bobby@badgerpower.com'    },
          { name: 'Brian Badger',     email: 'brian@badgerpower.com'    },
          { name: 'Franky Ferret',    email: 'franky@badgerpower.com'   },
          { name: 'Felicity Ferret',  email: 'felicity@badgerpower.com' },
        ],
        { reload: true }
      )
      t.is(Bobby.id, 1);
      t.is(Bobby.name, 'Bobby Badger');
      t.is(Brian.id, 2);
      t.is(Brian.name, 'Brian Badger');
      t.is(Franky.id, 3);
      t.is(Franky.name, 'Franky Ferret');
      t.is(Felicity.id, 4);
      t.is(Felicity.name, 'Felicity Ferret');
    }
  )

  test.serial(
    'insert companies',
    async t => {
      [BadgersInc, FerretsLtd] = await companies.insert(
        [
          { id: 100, name: 'Badgers Inc.' },
          { id: 200, name: 'Ferrets Ltd.' },
        ],
        { reload: true }
      );
      t.is(BadgersInc.id, 100);
      t.is(BadgersInc.name, 'Badgers Inc.');
      t.is(FerretsLtd.id, 200);
      t.is(FerretsLtd.name, 'Ferrets Ltd.');
    }
  )

  test.serial(
    'insert employees',
    async t => {
      const [a, b, c, d] = await employees.insert(
        [
          { user_id: Bobby.id,    company_id: BadgersInc.id, job_title: 'Chief Badger' },
          { user_id: Brian.id,    company_id: BadgersInc.id, job_title: 'Assistant Badger' },
          { user_id: Franky.id,   company_id: FerretsLtd.id, job_title: 'Senior Ferret' },
          { user_id: Felicity.id, company_id: FerretsLtd.id, job_title: 'Junior Ferret' },
        ],
        { reload: true }
      );
      t.is(a.user_id, Bobby.id);
      t.is(a.company_id, BadgersInc.id);
      t.is(a.job_title, 'Chief Badger');
      t.is(b.user_id, Brian.id);
      t.is(b.company_id, BadgersInc.id);
      t.is(b.job_title, 'Assistant Badger');
      t.is(c.user_id, Franky.id);
      t.is(c.company_id, FerretsLtd.id);
      t.is(c.job_title, 'Senior Ferret');
      t.is(d.user_id, Felicity.id);
      t.is(d.company_id, FerretsLtd.id);
      t.is(d.job_title, 'Junior Ferret');
    }
  )

  test.serial(
    'insert products',
    async t => {
      const nProducts = {
        100: 42,  // 42 products for BadgersInc
        200: 52   // 52 products for FerretsLtd
      }
      const productList = [BadgersInc.id, FerretsLtd.id].map(
        company_id => range(company_id, company_id + nProducts[company_id] - 1).map(
          id => ({ id, company_id, name: `Product #${id}` })
        )
      ).flat();
      await products.insert(productList, { sanitizeResult: true });
      t.pass();
    }
  )

  test.serial(
    'select all users',
    async t => {
      const rows = await userdb
        .select('id name email')
        .from('users')
        .all();
      t.is( rows.length, 4 );
    }
  )

  test.serial(
    'select all users with columns',
    async t => {
      const rows = await userdb
        .from('users')
        .columns('id name email')
        .all();
      t.is( rows.length, 4 );
    }
  )

  test.serial(
    'select all users with prefix',
    async t => {
      const rows = await userdb
        .from('users')
        .prefix('user_')
        .columns('id name email')
        .all();
      t.is( rows.length, 4 );
      t.is( rows[0].user_id,    Bobby.id );
      t.is( rows[0].user_name,  Bobby.name );
      t.is( rows[1].user_id,    Brian.id );
      t.is( rows[1].user_name,  Brian.name );
      t.is( rows[2].user_id,    Franky.id );
      t.is( rows[2].user_name,  Franky.name );
      t.is( rows[3].user_id,    Felicity.id );
      t.is( rows[3].user_name,  Felicity.name );
    }
  )

  test.serial(
    'select one user by id',
    async t => {
      const row = await userdb
        .select('name')
        .from('users')
        .where({ id: Bobby.id })
        .one();
      t.is( row.name, Bobby.name );
    }
  )

  test.serial(
    'select one user by id provided as value',
    async t => {
      const row = await userdb
        .select('name')
        .from('users')
        .where('id')
        .one([Bobby.id]);
      t.is( row.name, Bobby.name );
    }
  )

  test.serial(
    'select one user by id and name provided as values',
    async t => {
      const row = await userdb
        .select('name')
        .from('users')
        .where('id name')
        .one([Bobby.id, Bobby.name]);
      t.is( row.name, Bobby.name );
    }
  )

  test.serial(
    'select all users with id above Bobby',
    async t => {
      const rows = await userdb
        .select('name')
        .from('users')
        .where(['id', '>', Bobby.id])
        .all();
      t.is( rows.length, 3 );
      t.is( rows[0].name,  Brian.name );
      t.is( rows[1].name,  Franky.name );
      t.is( rows[2].name,  Felicity.name );
    }
  )

  test.serial(
    'select all users with id above Bobby provided as value',
    async t => {
      const rows = await userdb
        .select('name')
        .from('users')
        .where({ id: ['>'] })
        .all([Bobby.id]);
      t.is( rows.length, 3 );
      t.is( rows[0].name,  Brian.name );
      t.is( rows[1].name,  Franky.name );
      t.is( rows[2].name,  Felicity.name );
    }
  )

  test.serial(
    'select with join onto employees',
    async t => {
      const row = await userdb
        .select('users.name, employees.job_title')
        .from('users')
        .join('users.id=employees.user_id')
        .where({ 'users.id': Bobby.id })
        .one();
      t.is( row.name,      Bobby.name );
      t.is( row.job_title, 'Chief Badger');
    }
  )

  test.serial(
    'select with join onto employees and company',
    async t => {
      const row = await userdb
        .select('users.name, employees.job_title')
        .select(['companies.name', 'company_name'])
        .from('users')
        .join('users.id=employees.user_id')
        .join('employees.company_id=companies.id')
        .where('users.id')
        .one([Bobby.id]);
      t.is( row.name,         Bobby.name );
      t.is( row.job_title,    'Chief Badger');
      t.is( row.company_name, 'Badgers Inc.');
    }
  )

  test.serial(
    'select with queries built on a base',
    async t => {
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
      t.is( row.name,         Bobby.name );
      t.is( row.job_title,    'Chief Badger');
      t.is( row.company_name, 'Badgers Inc.');

      // fetch all employees of a company
      const rows = await employees
        .where('companies.id')
        .all([BadgersInc.id])
      t.is( rows.length, 2 );
      t.is( rows[0].name,         Bobby.name );
      t.is( rows[0].job_title,    'Chief Badger');
      t.is( rows[0].company_name, 'Badgers Inc.');
      t.is( rows[1].name,         Brian.name );
      t.is( rows[1].job_title,    'Assistant Badger');
      t.is( rows[1].company_name, 'Badgers Inc.');

      const badger = await employees
        .select('users.id')
        .where('employees.job_title')
        .one(['Chief Badger'])
      t.is( badger.id,           Bobby.id );
      t.is( badger.name,         Bobby.name );
      t.is( badger.job_title,    'Chief Badger');
      t.is( badger.company_name, 'Badgers Inc.');
    }
  )

  test.serial(
    'select range of products for a company',
    async t => {
      const rows = await userdb
        .select('id name')
        .from('products')
        .where({ company_id: BadgersInc.id })
        .range(10, 19)
        .all();
      t.is( rows.length, 10 );
      t.is( rows[0].name, `Product #110` );
      t.is( rows[9].name, `Product #119` );
    }
  );

  test.serial(
    'count products by company',
    async t => {
      const rows = await userdb
        .select('companies.id companies.name', sql`COUNT(products.id) AS n_products`)
        .from('companies')
        .join('companies.id=products.company_id')
        .group('companies.id')
        .order('companies.id')
        .all();
      t.is( rows.length, 2 );
      t.is( rows[0].id, 100 )
      t.is( rows[0].name, 'Badgers Inc.' )
      t.is( parseInt(rows[0].n_products), 42 )
      t.is( rows[1].id, 200 )
      t.is( rows[1].name, 'Ferrets Ltd.' )
      t.is( parseInt(rows[1].n_products), 52 )
    }
  );

  test.serial(
    'count products by company having > 50 products',
    async t => {
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
        .all([50]);
      t.is( rows.length, 1 );
      t.is( rows[0].id, 200 )
      t.is( rows[0].name, 'Ferrets Ltd.' )
      t.is( parseInt(rows[0].n_products), 52 )
    }
  );

  test.after(
    'disconnect',
    async t => {
      await userdb.run('dropProductsTable');
      await userdb.run('dropEmployeesTable');
      await userdb.run('dropCompaniesTable');
      await userdb.run('dropUsersTable');
      userdb.disconnect();
      t.pass();
    }
  )
}