import test from 'ava';
import { parseRelationString, relationConfig } from "../../src/Utils/Relation.js";

test( 'a->b.c',
  t => {
    const config = parseRelationString('a->b.c');
    t.is( config.type,  'one');
    t.is( config.from,  'a');
    t.is( config.table, 'b');
    t.is( config.to,    'c');
  }
);

test( 'd -> e.f',
  t => {
    const config = parseRelationString('d -> e.f');
    t.is( config.type,  'one');
    t.is( config.from,  'd');
    t.is( config.table, 'e');
    t.is( config.to,    'f');
  }
);

test( 'a~>b.c',
  t => {
    const config = parseRelationString('a~>b.c');
    t.is( config.type,  'any');
    t.is( config.from,  'a');
    t.is( config.table, 'b');
    t.is( config.to,    'c');
  }
);

test( 'd ~> e.f',
  t => {
    const config = parseRelationString('d ~> e.f');
    t.is( config.type,  'any');
    t.is( config.from,  'd');
    t.is( config.table, 'e');
    t.is( config.to,    'f');
  }
);

test( 'gee => aitch.eye',
  t => {
    const config = parseRelationString('gee => aitch.eye');
    t.is( config.type,  'many');
    t.is( config.from,  'gee');
    t.is( config.table, 'aitch');
    t.is( config.to,    'eye');
  }
);

test( 'invalid relation',
  t => {
    const error = t.throws(
      () => parseRelationString('x ==> y.z')
    );
    t.is( error.message,  'Invalid relation string specified: x ==> y.z' );
  }
);

test( 'relation config rewriting',
  t => {
    const config = relationConfig(
      'users',
      'pleasantries',
      {
        localKey:  'wibble',
        remoteKey: 'wobble',
        table:     'frusset',
        type:      'pouch',
      }
    )
    t.is( config.from, 'wibble' );
    t.is( config.to, 'wobble' );
    t.is( config.table, 'frusset' );
    t.is( config.type, 'pouch' );
    t.is( config.name, 'users.pleasantries' );
  }
);

test( 'relation config string',
  t => {
    const config = relationConfig('foo', 'bar', 'a -> b.c');
    t.is( config.from, 'a' );
    t.is( config.table, 'b' );
    t.is( config.to, 'c' );
    t.is( config.type, 'one' );
    t.is( config.name, 'foo.bar' );
  }
);

test( 'relation config relation string',
  t => {
    const config = relationConfig(
      'foo', 'bar',
      {
        relation: 'a -> b.c',
        order: 'd'
      }
    );
    t.is( config.from, 'a' );
    t.is( config.table, 'b' );
    t.is( config.to, 'c' );
    t.is( config.type, 'one' );
    t.is( config.name, 'foo.bar' );
    t.is( config.order, 'd' );
  }
);

test( 'relation with missing "from"',
  t => {
    const error = t.throws(
      () => relationConfig(
        'users',
        'pleasantries',
        {
          frim:  'wibble',
          to:    'wobble',
          table: 'frusset',
          type:  'pouch',
        }
      )
    );
    t.is( error.message,  'Missing "from" in pleasantries relation for users table' );
  }
);

