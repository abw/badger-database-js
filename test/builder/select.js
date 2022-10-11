import test from 'ava';
import Select from '../../src/Builder/Select.js';
import { connect } from '../../src/Database.js'
import { sql } from '../../src/Utils/Tags.js';

let db;

test.serial(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test.serial(
  'select',
  async t => {
    const op = db.from('a').select('b');
    t.true( op instanceof Select )
    t.is( op.sql(), 'SELECT "b"\nFROM "a"' );
  }
)

test.serial(
  'select multiple columns',
  async t => {
    const op = db.from('a').select('b c');
    t.is( op.sql(), 'SELECT "b", "c"\nFROM "a"' );
  }
)

test.serial(
  'select multiple tables with commas',
  async t => {
    const op = db.from('a').select('b,c, d');
    t.is( op.sql(), 'SELECT "b", "c", "d"\nFROM "a"' );
  }
)

test.serial(
  'select array of columns',
  async t => {
    const op = db.from('a').select(['b', 'c']);
    t.is( op.sql(), 'SELECT "b", "c"\nFROM "a"' );
  }
)

test.serial(
  'select columns with table name',
  async t => {
    const op = db.from('a').select('x.b c');
    t.is( op.sql(), 'SELECT "x"."b", "c"\nFROM "a"' );
  }
)

test.serial(
  'select sql in object',
  async t => {
    const op = db.from('a').select({ sql: 'b as bravo' });
    t.is( op.sql(), 'SELECT b as bravo\nFROM "a"' );
  }
)

test.serial(
  'select tagged sql',
  async t => {
    const op = db.from('a').select(sql`b as bravo`);
    t.is( op.sql(), 'SELECT b as bravo\nFROM "a"' );
  }
)

test.serial(
  'select from last table in string',
  async t => {
    const op = db.from('a b').select('x y');
    t.is( op.sql(), 'SELECT "x", "y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from last table in array',
  async t => {
    const op = db.from(['a', 'b']).select('x y');
    t.is( op.sql(), 'SELECT "x", "y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from last table in multiple tables',
  async t => {
    const op = db.from('a', 'b').select('x y');
    t.is( op.sql(), 'SELECT "x", "y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from table with alias',
  async t => {
    const op = db.from({ table: 'a', as: 'b' }).select('x y');
    t.is( op.sql(), 'SELECT "x", "y"\nFROM "a" AS "b"' );
  }
)

test.serial(
  'select column with alias from table',
  async t => {
    const op = db.from({ table: 'a', as: 'b' }).select({ column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "x" AS "y"\nFROM "a" AS "b"' );
  }
)

test.serial(
  'select multiple items',
  async t => {
    const op = db.from('a').select('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "b", "c", "d", "e", "f", "x" AS "y"\nFROM "a"' );
  }
)

test.serial(
  'select column with table name and alias in object',
  async t => {
    const op = db.from('a').select('b', 'c d', ['e', 'f'], { column: 'y', table: 'x', as: 'z'});
    t.is( op.sql(), 'SELECT "b", "c", "d", "e", "f", "x"."y" AS "z"\nFROM "a"' );
  }
)

test.serial(
  'select columns with table name and prefix in object',
  async t => {
    const op = db
      .from('users companies')
      .select(
        { table: 'users', columns: 'id name' },
        { table: 'companies', columns: 'id name', prefix: 'company_'}
      );
    t.is(
      op.sql(),
      'SELECT "users"."id", "users"."name", "companies"."id" AS "company_id", "companies"."name" AS "company_name"\nFROM "users", "companies"'
    );
  }
)

test.serial(
  'select column with table name in object',
  async t => {
    const op = db.from('a').select('b', 'c d', ['e', 'f'], { column: 'y', table: 'x' });
    t.is( op.sql(), 'SELECT "b", "c", "d", "e", "f", "x"."y"\nFROM "a"' );
  }
)

test.after(
  'disconnect',
  async t => {
    db.disconnect();
    t.pass();
  }
)
