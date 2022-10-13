// work in progress / experiment
import { fail, hasValue, isArray, isFunction, isObject, isString, noValue, objMap } from "@abw/badger-utils";
import { unknown } from "./Constants.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { notImplementedInBaseClass, QueryBuilderError } from "./Utils/Error.js";
import { format } from "./Utils/Format.js";
// import { Builders } from './Builders.js'

const defaultContext = () => ({
  whereValues:  [ ],
  havingValues: [ ],
  placeholder:  1,
});

// Each of the parts of a select query in order.  The first entry
// is the opening keyword, the second is the text used to join
// multiple values, e.g. { where: ['a=1', 'b=2'] } is expanded to
// WHERE a=1 AND b=2.  Note that the entries must have whitespace
// where applicable, e.g. after the opening keyword, e.g. 'WHERE ',
// and around joining keywords/syntax, e.g. ' AND '
const parts = {
  before:  ['',          "\n"     ],  // 0
  // with: 10
  select:  ['SELECT ',   ', '     ],  // 20
  from:    ['FROM ',     ', '     ],  // 30
  join:    ['',          "\n"     ],  // 40
  where:   ['WHERE ',    ' AND '  ],  // 50
  group:   ['GROUP BY ', ', '     ],  // 60
  having:  ['HAVING ',   ' AND '  ],  // 70
  order:   ['ORDER BY ', ', '     ],  // 80
  limit:   ['LIMIT ',    ' '      ],  // 90
  offset:  ['OFFSET ',   ' '      ],  // 95
  after:   ['',          "\n"     ],  // 100
};

const notImplemented = notImplementedInBaseClass('Builder');

export class Builder {
  constructor(parent, ...args) {
    // this.factory  = factory;
    this.parent   = parent;
    this.args     = args;

    // copy static class variables into this, including messages for generating
    // error messages via errorMsg(), the name of the build method which is also
    // the default key for storing things in the context, the keyword and joint
    // used to generate the SQL
    this.messages = this.constructor.messages;
    this.method   = this.constructor.buildMethod;
    this.keyword  = this.constructor.keyword;
    this.joint    = this.constructor.joint;
    this.key      = this.constructor.contextSlot || this.method;

    // call the initialisation method to allow subclasses to tweak these
    this.initBuilder(...args);

    // add debug() and debugData() methods
    addDebugMethod(this, 'builder', { debugPrefix: this.key && `Builder:${this.key}` });
  }

  initBuilder() {
    // stub for subclasses
  }

  async one(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(args);
    this.debugData("one()", { sql, values });
    return db.one(sql, values);
  }

  async any(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(args);
    this.debugData("any()", { sql, values });
    return db.any(sql, values);
  }

  async all(args) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(args);
    this.debugData("all()", { sql, values });
    return db.all(sql, values);
  }

  allValues(where=[]) {
    const context = this.resolveChain();
    const wvalues = context.whereValues;
    const hvalues = context.havingValues;
    // In the usual case we just get one set of extra args and they
    // go at the end.  But if there's some need to jiggle the parameters
    // more then a function can be provided.
    if (isFunction(where)) {
      return where(wvalues, hvalues);
    }
    return [...wvalues, ...hvalues, ...where]
  }

  whereValues(...values) {
    if (values.length) {
      this.context.whereValues.push(...values);
    }
    return this.context.whereValues;
  }

  havingValues(...values) {
    if (values.length) {
      this.context.havingValues.push(...values);
    }
    return this.context.havingValues;
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
        if (noValue(part) || noValue(value)) {
          return null;
        }
        if (isArray(value) && value.length) {
          return part[0] + value.join(part[1]);
        }
        return part[0] + value;
      }
    )
  }

  // resolve the complete chain from top to bottom
  resolveChain() {
    return this.context || this.resolve(
      this.parent
        ? this.parent.resolveChain()
        : defaultContext()
    );
  }

  // resolve a link in the chain and merge into parent context
  resolve(context, args={}) {
    const key = this.key;
    this.context = {
      ...context,
      ...args
    }
    const values = this.resolveLink();
    this.context[key] = [...(this.context[key] || []), ...values];
    return this.context;
  }

  // resolve a link in the chain
  resolveLink() {
    return this.args.map(
      item => (isObject(item) && item.sql)
        ? item.sql
        : this.resolveLinkItem(item)
    ).flat()
  }

  // resolve an individual argument for a link in the chain
  resolveLinkItem(item) {
    if (isString(item)) {
      return this.resolveLinkString(item);
    }
    else if (isArray(item)) {
      return this.resolveLinkArray(item);
    }
    else if (isFunction(item)) {
      return item(this);
    }
    else if (isObject(item)) {
      return this.resolveLinkObject(item);
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
  lookup(key, error) {
    return this[key] ||
      (this.parent
        ? this.parent.lookup(key)
        : fail(error || `Missing item in query chain: ${key}`))
  }

  lookupDatabase() {
    return this.context.database || this.lookup('database');
  }

  lookupTable() {
    return this.context.table || this.lookup('table');
  }

  quote(item) {
    return this.lookupDatabase().quote(item)
  }

  tableColumn(table, column) {
    return column.match(/\./)
      ? column
      : `${table}.${column}`;
  }

  quoteTableColumn(table, column) {
    return this.quote(
      this.tableColumn(table, column)
    )
  }

  quoteTableAs(table, as) {
    return [
      this.quote(table),
      this.quote(as)
    ].join(' AS ');
  }

  quoteTableColumnAs(table, column, as) {
    return [
      this.quoteTableColumn(table, column),
      this.quote(as)
    ].join(' AS ')
  }

  quoteColumnAs(column, as) {
    return [
      this.quote(column),
      this.quote(as)
    ].join(' AS ')
  }

  errorMsg(msgFormat, args) {
    const method = this.method || unknown;
    return this.error(
      format(
        this.messages?.[msgFormat] || fail("Invalid message format: ", msgFormat),
        { method, ...args }
      )
    )
  }

  error(...args) {
    const etype   = this.errorType || QueryBuilderError;
    throw new etype(args.join(''))
  }
}

export default Builder