import test from 'ava';
import { connect, Builder, registerBuilder, comma, QueryBuilderError } from '../../src/index.js';
import { range } from '@abw/badger-utils';

class Animal extends Builder {
  static buildMethod = 'animal'
  static buildOrder  = 0
  static keyword     = '#'
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [animal, count].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "animal" and "count".',
  }

  resolveLinkString(arg) {
    return arg;
  }

  resolveLinkArray(arg) {
    if (arg.length === 2) {
      return this.repeatAnimal(...arg);
    }
    this.errorMsg('array', { n: arg.length });
  }

  resolveLinkObject(arg) {
    if (arg.animal) {
      return this.repeatAnimal(arg.animal, arg.count);
    }
    this.errorMsg('object', { keys: Object.keys(arg).sort().join(', ') });
  }

  repeatAnimal(animal, count=1) {
    return range(1, count).map( () => animal )
  }
}

registerBuilder(Animal)

let db;

test.before(
  'connect',
  async t => {
    db = await connect({ database: 'sqlite:memory' });
    t.is( db.engine.engine, 'sqlite' );
  }
)

test(
  'animal',
  t => {
    const op = db.builder().animal('badger');
    t.true( op instanceof Animal )
  }
)

test(
  "one badger",
  t => {
    const op = db.builder().animal('Badger');
    t.is( op.sql(), '# Badger' );
  }
)

test(
  "three badgers",
  t => {
    const op = db.builder().animal(['Badger', 3]);
    t.is( op.sql(), '# Badger, Badger, Badger' );
  }
)

test(
  "five badgers",
  t => {
    const op = db.builder().animal({ animal: 'Badger', count: 5 });
    t.is( op.sql(), '# Badger, Badger, Badger, Badger, Badger' );
  }
)

test(
  "multiple calls",
  t => {
    const op = db.builder()
      .select('foo')
      .animal(['Badger', 3])
      .from('bar')
      .animal(['Mushroom', 2])
      .where('c')
      .animal('Snake');
    t.is(
      op.sql(), '# Badger, Badger, Badger, Mushroom, Mushroom, Snake\nSELECT "foo"\nFROM "bar"\nWHERE "c" = ?'
    )
  }
)

test(
  'invalid array',
  t => {
    const error = t.throws(
      () => db.builder().animal(['Badger', 'Mushroom', 'Snake']).sql()
    );
    t.true( error instanceof QueryBuilderError );
    t.is(
      error.message,
      'Invalid array with 3 items specified for query builder "animal" component. Expected [animal, count].'
    );
  }
)

test.after(
  'disconnect',
  t => {
    db.disconnect();
    t.pass();
  }
)
