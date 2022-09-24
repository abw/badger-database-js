// work in progress / experiment
import { addDebug } from "@abw/badger";
import { hasValue, objMap } from "@abw/badger-utils";

const defaultContext = () => ({
  after:   [ ],
  before:  [ ],
  from:    [ ],
  group:   [ ],
  having:  [ ],
  join:    [ ],
  order:   [ ],
  select:  [ ],
  where:   [ ],
  unknown: [ ],
});

// Each of the parts of a select query in order.  The first entry
// is the opening keyword, the second is the text used to join
// multiple values, e.g. { where: ['a=1', 'b=2'] } is expanded to
// WHERE a=1 AND b=2.  Note that the entries must have whitespace
// where applicable, e.g. after the opening keyword, e.g. 'WHERE ',
// and around joining keywords/syntax, e.g. ' AND '
const parts = {
  before:  ['',          "\n"     ],
  select:  ['SELECT ',   ', '     ],
  from:    ['FROM ',     ', '     ],
  join:    ['JOIN ',     "\nJOIN "],
  where:   ['WHERE ',    ' AND '  ],
  group:   ['GROUP BY ', ', '     ],
  having:  ['HAVING ',   ' AND '  ],
  order:   ['ORDER BY ', ', '     ],
  after:   ['',          "\n"     ],
};

export class Operator {
  constructor(factory, parent, ...args) {
    this.factory = factory;
    this.parent  = parent;
    this.args    = args;
    this.key     = 'unknown';
    this.initOperator(...args);

    // debugging
    addDebug(this, false, 'Operator > ', 'red');
    this.debug("parent: ", parent?.constructor.name);
    this.debug("args: ", args);
  }
  initOperator() {
    // stub for subclasses
  }
  resolveChain() {
    return this.resolve(
      this.parent
        ? this.parent.resolveChain()
        : defaultContext()
    );
  }
  resolve(context) {
    const key = this.key;
    return {
      ...context,
      [key]: [...context[key], ...this.args]
    }
  }
  sqlFragments(context=this.resolveChain()) {
    return objMap(
      context,
      (value, key) => {
        const part = parts[key];
        return part && value.length
          ? part[0] + value.join(part[1])
          : null;
      }
    )
  }
  sql() {
    const frags = this.sqlFragments();

    return Object.keys(parts)
      .map( part => frags[part] )
      .filter( i => hasValue(i) )
      .join("\n");
  }
}

export default Operator