import test from 'ava';
import From from '../../src/Builder/From.js';
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
  'from table',
  async t => {
    const op = db.from('a');
    t.true( op instanceof From )
    t.is( op.sql(), 'FROM "a"' );
  }
)

test.serial(
  'from tables',
  async t => {
    const op = db.from('a, b c');
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test.serial(
  'from multiple tables',
  async t => {
    const op = db.from('a', 'b', 'c');
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test.serial(
  'from array of tables',
  async t => {
    const op = db.from(['a', 'b', 'c']);
    t.is( op.sql(), 'FROM "a", "b", "c"' );
  }
)

test.serial(
  'from sql in object',
  async t => {
    const op = db.from({ sql: 'a as alpha' });
    t.is( op.sql(), 'FROM a as alpha' );
  }
)

test.serial(
  'from tagged sql',
  async t => {
    const op = db.from(sql`a as alpha`);
    t.is( op.sql(), 'FROM a as alpha' );
  }
)

test.serial(
  'from multiple items',
  async t => {
    const op = db.from('a', ['b', 'c'], { sql: 'd as delta'});
    t.is( op.sql(), 'FROM "a", "b", "c", d as delta' );
  }
)

test.serial(
  'from aliased table',
  async t => {
    const op = db.from({ table: 'a', as: 'b' });
    t.is( op.sql(), 'FROM "a" AS "b"' );
  }
)

