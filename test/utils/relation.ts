import { expect, test } from 'vitest'
import { parseRelationString, relationConfig } from "../../src/Utils"

test( 'a->b.c',
  () => {
    const config = parseRelationString('a->b.c');
    expect(config.type).toBe('one')
    expect(config.from).toBe('a')
    expect(config.table).toBe('b')
    expect(config.to).toBe('c')
  }
);

test( 'd -> e.f',
  () => {
    const config = parseRelationString('d -> e.f');
    expect(config.type).toBe('one')
    expect(config.from).toBe('d')
    expect(config.table).toBe('e')
    expect(config.to).toBe('f')
  }
);

test( 'a~>b.c',
  () => {
    const config = parseRelationString('a~>b.c');
    expect(config.type).toBe('any')
    expect(config.from).toBe('a')
    expect(config.table).toBe('b')
    expect(config.to).toBe('c')
  }
);

test( 'd ~> e.f',
  () => {
    const config = parseRelationString('d ~> e.f');
    expect(config.type).toBe('any')
    expect(config.from).toBe('d')
    expect(config.table).toBe('e')
    expect(config.to).toBe('f')
  }
);

test( 'gee => aitch.eye',
  () => {
    const config = parseRelationString('gee => aitch.eye');
    expect(config.type).toBe('many')
    expect(config.from).toBe('gee')
    expect(config.table).toBe('aitch')
    expect(config.to).toBe('eye')
  }
);

test( 'jay #> kay.el',
  () => {
    const config = parseRelationString('jay #> kay.el');
    expect(config.type).toBe('map')
    expect(config.from).toBe('jay')
    expect(config.table).toBe('kay')
    expect(config.to).toBe('el')
  }
);

test( 'invalid relation',
  () => {
    expect(
      () => parseRelationString('x ==> y.z')
    ).toThrowError(
      'Invalid relation string specified: x ==> y.z'
    )
  }
);

test( 'relation config rewriting',
  () => {
    const config = relationConfig(
      'users',
      'pleasantries',
      {
        localKey:  'wibble',
        remoteKey: 'wobble',
        table:     'frusset',
        type:      'any',
      }
    )
    expect(config.from).toBe('wibble')
    expect(config.to).toBe('wobble')
    expect(config.table).toBe('frusset')
    expect(config.type).toBe('pouch')
    expect(config.name).toBe('users.pleasantries');
  }
);

test( 'relation config string',
  () => {
    const config = relationConfig('foo', 'bar', 'a -> b.c');
    expect(config.from).toBe('a')
    expect(config.table).toBe('b')
    expect(config.to).toBe('c')
    expect(config.type).toBe('one')
    expect(config.name).toBe('foo.bar')
  }
);

test( 'relation config relation string',
  () => {
    const config = relationConfig(
      'foo', 'bar',
      {
        relation: 'a -> b.c',
        order: 'd'
      }
    );
    expect(config.from).toBe('a')
    expect(config.table).toBe('b')
    expect(config.to).toBe('c')
    expect(config.type).toBe('one')
    expect(config.name).toBe('foo.bar')
    expect(config.order).toBe('d')
  }
);

test( 'relation config relation map string',
  () => {
    const config = relationConfig(
      'foo', 'bar',
      {
        relation: 'a #> b.c',
        key: 'e',
        value: 'f'
      }
    );
    expect(config.from).toBe('a')
    expect(config.table).toBe('b')
    expect(config.to).toBe('c')
    expect(config.type).toBe('map')
    expect(config.name).toBe('foo.bar')
    expect(config.key).toBe('e')
    expect(config.value).toBe('f')
  }
);

test( 'relation with missing "from"',
  () => {
    expect(
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
    ).toThrowError(
      'Missing "from" in pleasantries relation for users table'
    )
  }
);

