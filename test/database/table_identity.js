import test from 'ava';
import { connect } from '../../src/Database.js';

let db;

test.before(
  'connect',
  t => {
    db = connect({
      database: 'sqlite:memory',
      tables: {
        users: {
          columns: 'id name email'
        },
        companies: {
          columns: 'company_id:id name email'
        },
        employees: {
          columns: 'user_id:key company_id:key job_title'
        },
        badgers: {
          columns: 'id name'
        },
        ferrets: {
          id: 'ferret_id',
          columns: 'ferret_id name'
        },
        stoats: {
          keys: 'key1 key2',
          columns: 'key1 key2 name'
        },
      }
    })
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'users identity',
  async t => {
    const users = await db.table('users');
    t.deepEqual(
      users.identity({ id: 123, name: 'OneTwoThree' }),
      {
        id: 123,
      }
    )
  }
);

test.serial(
  'companies identity',
  async t => {
    const companies = await db.table('companies');
    t.deepEqual(
      companies.identity({ company_id: 456, name: 'OneTwoThree' }),
      {
        company_id: 456,
      }
    )
  }
);

test.serial(
  'employees identity',
  async t => {
    const employees = await db.table('employees');
    t.deepEqual(
      employees.identity({ user_id: 123, company_id: 456, name: 'OneTwoThree' }),
      {
        user_id: 123,
        company_id: 456,
      }
    )
  }
);

test.serial(
  'badgers id and keys',
  async t => {
    const badgers = await db.table('badgers');
    t.is( badgers.id, 'id' );
    t.deepEqual( badgers.keys, ['id'] );
    t.deepEqual(
      badgers.identity({ id: 123, name: 'OneTwoThree' }),
      {
        id: 123,
      }
    )
  }
);

test.serial(
  'ferrets id and keys',
  async t => {
    const ferrets = await db.table('ferrets');
    t.is( ferrets.id, 'ferret_id' );
    t.deepEqual( ferrets.keys, ['ferret_id'] );
    t.deepEqual(
      ferrets.identity({ ferret_id: 123, name: 'OneTwoThree' }),
      {
        ferret_id: 123,
      }
    )
  }
);

test.serial(
  'stoats id and keys',
  async t => {
    const stoats = await db.table('stoats');
    t.is( stoats.id, undefined );
    t.deepEqual( stoats.keys, ['key1', 'key2'] );
    t.deepEqual(
      stoats.identity({ key1: 123, key2: 456, name: 'OneTwoThree' }),
      {
        key1: 123,
        key2: 456,
      }
    )
  }
);

test.after(
  () => db.disconnect()
)