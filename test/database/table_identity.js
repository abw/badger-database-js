import { expect, test } from 'vitest'
import { connect } from '../../src/Database.js'

let db;

test( 'connect',
  () => {
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
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'users identity',
  async () => {
    const users = await db.table('users');
    expect(
      users.identity({ id: 123, name: 'OneTwoThree' })
    ).toStrictEqual({
      id: 123,
    })
  }
)

test( 'companies identity',
  async () => {
    const companies = await db.table('companies');
    expect(
      companies.identity({ company_id: 456, name: 'OneTwoThree' })
    ).toStrictEqual({
      company_id: 456,
    })
  }
)

test( 'employees identity',
  async () => {
    const employees = await db.table('employees');
    expect(
      employees.identity({ user_id: 123, company_id: 456, name: 'OneTwoThree' })
    ).toStrictEqual({
      user_id: 123,
      company_id: 456,
    })
  }
)

test( 'badgers id and keys',
  async () => {
    const badgers = await db.table('badgers');
    expect( badgers.id, 'id' );
    expect( badgers.keys, ['id'] );
    expect(
      badgers.identity({ id: 123, name: 'OneTwoThree' })
    ).toStrictEqual({
      id: 123,
    })
  }
)

test( 'ferrets id and keys',
  async () => {
    const ferrets = await db.table('ferrets');
    expect( ferrets.id, 'ferret_id' );
    expect( ferrets.keys, ['ferret_id'] );
    expect(
      ferrets.identity({ ferret_id: 123, name: 'OneTwoThree' })
    ).toStrictEqual({
      ferret_id: 123,
    })
  }
)

test( 'stoats id and keys',
  async () => {
    const stoats = await db.table('stoats');
    expect( stoats.id, undefined );
    expect( stoats.keys, ['key1', 'key2'] );
    expect(
      stoats.identity({ key1: 123, key2: 456, name: 'OneTwoThree' })
    ).toStrictEqual({
      key1: 123,
      key2: 456,
    })
  }
);

test( 'disconnect',
  () => db.disconnect()
)