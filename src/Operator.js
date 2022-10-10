// work in progress / experiment
import { fail, hasValue, isArray, isFunction, isObject, isString, objMap } from "@abw/badger-utils";
import { addDebugMethod } from "./Utils/Debug.js";
import { notImplementedInBaseClass } from "./Utils/Error.js";

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
  values:  [ ],
  placeholder: 1,
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

const notImplemented = notImplementedInBaseClass('Operator');

export class Operator {
  constructor(factory, parent, ...args) {
    this.factory = factory;
    this.parent  = parent;
    this.args    = args;
    // this.key     = 'unknown';
    this.initOperator(...args);
    addDebugMethod(this, 'operator', { debugPrefix: this.key && `Operator:${this.key}` });
  }
  initOperator() {
    // stub for subclasses
  }

  async one(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.values(args);
    this.debugData("one()", { sql, values });
    return db.one(sql, values);
  }
  async any(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.values(args);
    this.debugData("any()", { sql, values });
    return db.any(sql, values);
  }
  async all(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.values(args);
    this.debugData("all()", { sql, values });
    return db.all(sql, values);
  }

  values(extra=[]) {
    const context = this.resolveChain();
    const values  = context.values;
    // console.log('context values: ', values);
    // console.log('extra values: ', extra);
    // TODO: havingValues
    return [
      ...values, ...extra
    ]
  }

  // generate SQL
  sql() {
    const frags = this.sqlFragments();
    return Object.keys(parts)
      .map( part => frags[part] )
      .filter( i => hasValue(i) )
      .join("\n");
  }

  // generate and collect SQL fragments for each item in the chain
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

  // resolve the complete chain from top to bottom
  resolveChain() {
    return this.context ||= this.resolve(
      this.parent
        ? this.parent.resolveChain()
        : defaultContext()
    );
  }

  // resolve a link in the chain and merge into parent context
  resolve(context, args={}) {
    const key = this.key;
    const newContext = {
      ...context,
      ...args
    }
    const values = this.resolveLink(context);
    newContext[key] = [...(context[key] || []), ...values];
    return newContext;
    /*
    return {
      ...context,
      [key]: [...(context[key] || []), ...this.resolveLink(context)],
      ...args
    }
    */
  }

  // resolve a link in the chain
  resolveLink(context) {
    return this.args.map(
      item => (isObject(item) && item.sql)
        ? item.sql
        : this.resolveLinkItem(item, context)
    ).flat()
  }

  // resolve an individual argument for a link in the chain
  resolveLinkItem(item, context) {
    if (isString(item)) {
      return this.resolveLinkString(item, context);
    }
    else if (isArray(item)) {
      return this.resolveLinkArray(item, context);
    }
    else if (isFunction(item)) {
      return item(context);
    }
    else if (isObject(item)) {
      return this.resolveLinkObject(item, context);
    }
    fail("Invalid link item: ", item);
  }

  resolveLinkString() {
    notImplemented("resolveLinkString()");
  }
  resolveLinkArray() {
    notImplemented("resolveLinkArray()");
  }
  resolveLinkObject() {
    notImplemented("resolveLinkObject()");
  }

  // utility methods
  quote(item, context={}) {
    return this.lookupDatabase(context).quote(item)
  }
  lookup(key, error) {
    return this[key] ||
      (this.parent
        ? this.parent.lookup(key)
        : fail(error || `Missing item in query chain: ${key}`))
  }
  lookupDatabase(context={}) {
    return context.database || this.lookup('database');
  }
  lookupTable(context={}) {
    return context.table || this.lookup('table');
  }
  tableColumn(column, table=this.lookupTable()) {
    return column.match(/\./)
      ? column
      : `${table}.${column}`;
  }
  quoteTableColumn(column, table=this.lookupTable()) {
    return this.quote(
      this.tableColumn(column, table)
    )
  }
  NFGlookupTable(context={}) {
    const from  = context.from || this.lookup('from');
    const table = from.at(-1) || fail('No tables have been defined to select from');
    return table;
  }
}

export default Operator