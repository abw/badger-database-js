// This example shows a custom query builder component
import { connect, Builder, registerBuilder, comma } from '@abw/badger-database';
import { color } from '@abw/badger';
import { range } from '@abw/badger-utils';

//-----------------------------------------------------------------------------
// Define a custom builder component
// db.build.animal('Badger')       // -> # Badger
// db.build.animal(['Badger', 3])  // -> # Badger, Badger, Badger
// db.build.animal({ animal: 'Badger', count: 2 })  // -> # Badger, Badger
//-----------------------------------------------------------------------------
class Animal extends Builder {
  // the name of the builder method
  static buildMethod = 'animal'
  // where it appears in the SQL query, between 0 and 100
  static buildOrder  = 0
  // opening keyword, in this case a comment
  static keyword     = '#'
  // string to join multiple items
  static joint       = comma
  // error messages
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [animal, count].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "animal" and "count".',
  }

  resolveLinkString(arg) {
    // string argument is passed through
    return arg;
  }

  resolveLinkArray(arg) {
    if (arg.length === 2) {
      // two element array is [animal, repeat]
      return this.repeatAnimal(...arg);
    }
    this.errorMsg('array', { n: arg.length });
  }

  resolveLinkObject(arg) {
    if (arg.animal) {
      // object should have animal with optional repeat
      return this.repeatAnimal(arg.animal, arg.count);
    }
    this.errorMsg('object', { keys: Object.keys(arg).sort().join(', ') });
  }

  repeatAnimal(animal, count=1) {
    return range(1, count).map( () => animal )
  }
}

//-----------------------------------------------------------------------------
// Register the builder component
//-----------------------------------------------------------------------------
registerBuilder(Animal)

//-----------------------------------------------------------------------------
// Demonstrate usage
//-----------------------------------------------------------------------------
async function main() {
  const db = connect({ database: 'sqlite:memory' });
  const green = color('green');
  const red = color('red');

  // single argument
  console.log(
    "One badger\n" +
    green(
      db.build.animal('Badger').sql()
    )
  );

  // array argument
  console.log(
    "\nThree badgers\n" +
    green(
      db.build.animal(['Badger', 3]).sql()
    )
  )

  // object argument
  console.log(
    "\nFive badgers\n" +
    green(
      db.build.animal({ animal: 'Badger', count: 5 }).sql()
    )
  )

  // multiple calls
  console.log(
    "\nBadgers, Mushrooms and a Snake\n" +
    green(
      db.build
        .select('foo')
        .animal(['Badger', 3])
        .from('bar')
        .animal(['Mushroom', 2])
        .where('c')
        .animal('Snake')
        .sql()
    )
  )

  // error handling
  try {
    db.build.animal(['Badger', 'Mushroom', 'Snake']).sql()
  }
  catch (e) {
    console.log(
      "\nInvalid array error\n" +
      red(e.message)
    );
  }
}

main();