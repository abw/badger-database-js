import test from 'ava';
import Select from '../../src/Operator/Select.js';
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
    t.is( op.sql(), 'SELECT "a"."b"\nFROM "a"' );
  }
)

test.serial(
  'select multiple columns',
  async t => {
    const op = db.from('a').select('b c');
    t.is( op.sql(), 'SELECT "a"."b", "a"."c"\nFROM "a"' );
  }
)

test.serial(
  'select multiple tables with commas',
  async t => {
    const op = db.from('a').select('b,c, d');
    t.is( op.sql(), 'SELECT "a"."b", "a"."c", "a"."d"\nFROM "a"' );
  }
)

test.serial(
  'select array of columns',
  async t => {
    const op = db.from('a').select(['b', 'c']);
    t.is( op.sql(), 'SELECT "a"."b", "a"."c"\nFROM "a"' );
  }
)

test.serial(
  'select columns with table name',
  async t => {
    const op = db.from('a').select('x.b c');
    t.is( op.sql(), 'SELECT "x"."b", "a"."c"\nFROM "a"' );
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
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from last table in array',
  async t => {
    const op = db.from(['a', 'b']).select('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from last table in multiple tables',
  async t => {
    const op = db.from('a', 'b').select('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a", "b"' );
  }
)

test.serial(
  'select from table with alias',
  async t => {
    const op = db.from({ table: 'a', as: 'b' }).select('x y');
    t.is( op.sql(), 'SELECT "b"."x", "b"."y"\nFROM "a" AS "b"' );
  }
)

test.serial(
  'select column with alias from table',
  async t => {
    const op = db.from({ table: 'a', as: 'b' }).select({ column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "b"."x" AS "y"\nFROM "a" AS "b"' );
  }
)

test.serial(
  'select multiple items',
  async t => {
    const op = db.from('a').select('b', 'c d', ['e', 'f'], { column: 'x', as: 'y' });
    t.is( op.sql(), 'SELECT "a"."b", "a"."c", "a"."d", "a"."e", "a"."f", "a"."x" AS "y"\nFROM "a"' );
  }
)

test.after(
  'disconnect',
  async t => {
    db.disconnect();
    t.pass();
  }
)
