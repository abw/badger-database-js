import test from 'ava';
import Set from '../../src/Builder/Set.js';
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js';
import { sql } from '../../src/Utils/Tags.js';

let db;

test.before( 'connect',
  t => {
    db = connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test( 'set',
  t => {
    const op = db.build.set('a');
    t.true( op instanceof Set )
    t.is( op.sql(), 'SET "a" = ?' );
  }
)

test( 'set string',
  t => {
    const op = db.build.set('a, b c');
    t.is( op.sql(), 'SET "a" = ?, "b" = ?, "c" = ?' );
  }
)


test( 'columns string',
  t => {
    const query = db.build.update('users').set('id name email').where('name');
    t.is( query.sql(), 'UPDATE "users"\nSET "id" = ?, "name" = ?, "email" = ?\nWHERE "name" = ?' );
  }
)

test( 'array with two elements',
  t => {
    const query = db.build.update('users').set(['name', 'Bobby Badger']);
    t.is( query.sql(), 'UPDATE "users"\nSET "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Bobby Badger' );
  }
)

test( 'array with three elements',
  t => t.throws(
    () => db.build.update('users').set(['name', '!=', 'Bobby Badger']).sql(),
    {
      instanceOf: QueryBuilderError,
      message: 'Invalid array with 3 items specified for query builder "set" component. Expected [column, value].'
    }
  )
)

test( 'table name',
  t => {
    const query = db.build.update('users').set('users.name', 'u.email');
    t.is( query.sql(), 'UPDATE "users"\nSET "users"."name" = ?, "u"."email" = ?' );
  }
)

test( 'column with value',
  t => {
    const query = db.build.update('users').set({ name: 'Brian Badger' });
    t.is( query.sql(), 'UPDATE "users"\nSET "name" = ?' );
    t.is( query.allValues().length, 1 );
    t.is( query.allValues()[0], 'Brian Badger' );
  }
)

test( 'set sql clause',
  t => {
    const query = db.build.update('users').set(sql`x = foo`);
    t.is( query.sql(), 'UPDATE "users"\nSET x = foo' );
    t.is( query.allValues().length, 0 );
  }
)

test( 'generateSQL() with single value',
  t => {
    t.is( Set.generateSQL('a = ?'), 'SET a = ?' )
  }
)

test( 'generateSQL() with multiple values',
  t => {
    t.is( Set.generateSQL(['a = ?', 'b = ?']), 'SET a = ?, b = ?' )
  }
)

test.after( 'disconnect',
  () => db.disconnect()
)
