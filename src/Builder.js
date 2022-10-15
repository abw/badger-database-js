import { fail, hasValue, isArray, isFunction, isObject, isString } from "@abw/badger-utils";
import { newline, unknown } from "./Constants.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { notImplementedInBaseClass, QueryBuilderError } from "./Utils/Error.js";
import { format } from "./Utils/Format.js";
import { spaceAfter } from "./Utils/Space.js";

export let Builders   = { };
export let Generators = { };

const defaultContext = () => ({
  whereValues:  [ ],
  havingValues: [ ],
  placeholder:  1,
});

const notImplemented = notImplementedInBaseClass('Builder');

export class Builder {
  static generateSQL(values) {
    const keyword = this.keyword;
    const joint   = this.joint;
    return spaceAfter(keyword)
      + (isArray(values) ? values.join(joint) : values);
  }

  constructor(parent, ...args) {
    // this.factory  = factory;
    this.parent   = parent;
    this.args     = args;

    // copy static class variables into this, including messages for generating
    // error messages via errorMsg(), the name of the build method which is also
    // the default slot for storing things in the context
    this.messages = this.constructor.messages;
    this.method   = this.constructor.buildMethod;
    this.slot     = this.constructor.contextSlot || this.method;

    // call the initialisation method to allow subclasses to tweak these
    this.initBuilder(...args);

    // add debug() and debugData() methods
    addDebugMethod(this, 'builder', { debugPrefix: this.method && `Builder:${this.method}` });
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

  contextValues() {
    const { whereValues, havingValues } = this.resolveChain();
    return { whereValues, havingValues };
  }

  values(...args) {
    return this.allValues(...args);
  }

  allValues(where=[]) {
    const { whereValues, havingValues } = this.resolveChain();

    // In the usual case we just get one set of extra args and they
    // go at the end.  But if there's some need to jiggle the parameters
    // more then a function can be provided.
    if (isFunction(where)) {
      return where(whereValues, havingValues);
    }
    return [...whereValues, ...havingValues, ...where]
  }

  whereValues(...values) {
    if (values.length) {
      this.context.whereValues = [
        ...this.context.whereValues, ...values
      ];
    }
    return this.context.whereValues;
  }

  havingValues(...values) {
    if (values.length) {
      this.context.havingValues = [
        ...this.context.havingValues, ...values
      ];
    }
    return this.context.havingValues;
  }

  // generate SQL
  sql() {
    const context = this.resolveChain();

    return Object.entries(Generators)
      // sort generators by the buildOrder - the second array element in the value
      .sort( (a, b) => a[1][1] - b[1][1] )
      // filter out any that don't have slots defined
      .filter( ([slot]) => context[slot] )
      // call the generateSQL() static method
      .map( ([slot, entry]) => entry[0].generateSQL(context[slot]) )
      // filter out any that didn't return a value
      .filter( i => hasValue(i) )
      // join together into a single string
      .join(newline);
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
    const slot = this.slot;
    this.context = {
      ...context,
      ...args
    }
    const values = this.resolveLink();
    this.context[slot] = [...(this.context[slot] || []), ...values];
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