import { expect, test } from 'vitest'
import { range } from '@abw/badger-utils'
import { DatabaseInstance } from '@/src/types'
import { expectToThrowErrorTypeMessage } from '../library/expect.js'
import { connect, Builder, registerBuilder, comma, QueryBuilderError } from '../../src/index'

let db: DatabaseInstance

type AnimalName = string | [string, number] | AnimalObject
type AnimalObject = {
  animal: string
  count?: number
}

class Animal extends Builder {
  static buildMethod = 'animal'
  static buildOrder  = 0
  static validFor    = 'SELECT INSERT'
  static keyword     = '#'
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [animal, count].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "animal" and "count".',
  }

  resolveLinkString(arg: string) {
    return arg;
  }

  resolveLinkArray(arg: [string, number?]) {
    if (arg.length === 2) {
      // const [animal, count] = arg
      return this.repeatAnimal(...arg);
    }
    this.errorMsg('array', { n: arg.length });
  }

  resolveLinkObject(arg: AnimalObject) {
    if (arg.animal) {
      return this.repeatAnimal(arg.animal, arg.count);
    }
    this.errorMsg('object', { keys: Object.keys(arg).sort().join(', ') });
  }

  repeatAnimal(animal: string, count=1) {
    return range(1, count).map( () => animal )
  }
}

registerBuilder(Animal)

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' });
    expect(db.engine.engine).toBe('sqlite');
  }
)

test( 'animal',
  () => expect(
    db.build.animal('badger')
  ).toBeInstanceOf(
    Animal
  )
)

test( 'one badger',
  () => expect(
    db.build.animal('Badger').sql()
  ).toBe(
    '# Badger'
  )
)

test( 'three badgers',
  () => expect(
    db.build.animal(['Badger', 3]).sql(),
  ).toBe(
    '# Badger, Badger, Badger'
  )
)

test( 'five badgers',
  () => expect(
    db.build.animal({ animal: 'Badger', count: 5 }).sql()
  ).toBe(
    '# Badger, Badger, Badger, Badger, Badger'
  )
)

test( 'multiple calls',
  () => expect(
    db.build
      .select('foo')
      .animal(['Badger', 3])
      .from('bar')
      .animal(['Mushroom', 2])
      .where('c')
      .animal('Snake')
      .sql()
  ).toBe(
    '# Badger, Badger, Badger, Mushroom, Mushroom, Snake\nSELECT "foo"\nFROM "bar"\nWHERE "c" = ?'
  )
)

test( 'invalid array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.animal(['Badger', 'Mushroom', 'Snake']).sql(),
    QueryBuilderError,
    'Invalid array with 3 items specified for query builder "animal" component. Expected [animal, count].'
  )
)

test( "valid method for insert",
  () => expect(
    db.build
      .insert('name')
      .into('animals')
      .animal(['Badger', 3])
      .sql()
  ).toBe(
    '# Badger, Badger, Badger\nINSERT\nINTO "animals" ("name")\nVALUES (?)'
  )
)

test( 'invalid method for update',
  () => expectToThrowErrorTypeMessage(
    () => db.build.update('name').animal(['Badger', 'Mushroom', 'Snake']).sql(),
    QueryBuilderError,
    'animal() is not a valid builder method for an UPDATE query.'
  )
)

test( 'invalid method for delete',
  () => expectToThrowErrorTypeMessage(
    () => db.build.delete().animal(['Badger', 'Mushroom', 'Snake']).sql(),
    QueryBuilderError,
    'animal() is not a valid builder method for a DELETE query.'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
