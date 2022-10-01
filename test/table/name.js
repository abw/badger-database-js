import test from 'ava';
import { connect } from '../../src/Database.js';

let db;

test.before(
  'create database',
  async t => {
    db = await connect({
      database: 'sqlite:memory',
      tables: {
        people: {
          columns: 'a b c'
        },
        users: {
          table: 'user',
          columns: 'a b c'
        },
      }
    })
    t.is( db.engine.driver, 'sqlite' )
  }
)

test(
  'default name',
  async t => {
    const people = await db.table('people');
    t.is( people.table, 'people' );
  }
)

test(
  'custom name',
  async t => {
    const users = await db.table('users');
    t.is( users.table, 'user' );
  }
)
