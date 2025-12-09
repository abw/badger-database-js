import { newline, unknown } from './Constants'
import { DatabaseInstance, QueryOptions, QueryParams } from './types'
import { addDebugMethod, spaceAfter, notImplementedInBaseClass, QueryBuilderError } from './Utils'
import { fail, format, hasValue, isArray, isFunction, isObject, isString, noValue, splitList } from '@abw/badger-utils'

export type BuildersTable = Record<string, typeof Builder>
export let Builders: BuildersTable = { }
export let Generators = { }

const defaultContext = (): BuilderContext => ({
  setValues:    [ ],
  whereValues:  [ ],
  havingValues: [ ],
  placeholder:  1,
})

const notImplemented = notImplementedInBaseClass('Builder');

export type BuilderMessages = Record<string, string>
type BuilderValue = string | number | boolean | null
type BuilderValues = BuilderValue[]
type AllValuesWhereFunction = (
  setValues: BuilderValues,
  whereValues: BuilderValues,
  havingValues: BuilderValues,
) => BuilderValues
type AllValuesWhere = BuilderValues | AllValuesWhereFunction
export type Stringable = string | number | boolean
export type BuilderContext = Record<string, any>
export type ObjectWithSql = { sql: string }
/*
type BuilderResolveLinkItem =
    return this.args.map(
      (item: any) => (isObject(item) && item.sql)
        ? item.sql
        : this.resolveLinkItem(item)
    ).flat()
  }
*/

export class Builder {
  static keyword?: string
  static joint?: string
  static messages?: BuilderMessages
  static buildMethod?: string
  static buildAlias?: string
  static buildOrder?: number
  static contextSlot?: string
  static validFor?: string | Record<string, boolean>
  static subMethods?: string | Record<string, boolean>

  static generateSQL(values: Stringable | Stringable[], _context?: BuilderContext) {
    const keyword = this.keyword;
    const joint   = this.joint;
    return spaceAfter(keyword)
      + (isArray(values) ? values.join(joint) : values);
  }

  parent?: Builder
  args: any
  messages: BuilderMessages
  method: string
  slot: string
  errorType: new (message: string) => void
  context: BuilderContext
  debug!: (message: string) => void
  debugData!: (message: string, data: any) => void

  constructor(parent: Builder, ...args: any[]) {
    this.parent   = parent;
    this.args     = args;

    // copy static class variables into this, including messages for generating
    // error messages via errorMsg(), the name of the build method which is also
    // the default slot for storing things in the context
    this.messages = (this.constructor as typeof Builder).messages;
    this.method   = (this.constructor as typeof Builder).buildMethod;
    this.slot     = (this.constructor as typeof Builder).contextSlot || this.method;

    // call the initialisation method to allow subclasses to tweak these
    this.initBuilder(...args);

    // add debug() and debugData() methods
    addDebugMethod(
      this,
      'builder',
      { debugPrefix: this.method && `Builder:${this.method}` }
    );
  }

  initBuilder(...args: any[]) {
    // stub for subclasses
  }

  async one(
    params?: QueryParams,
    options?: QueryOptions
  ) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(params);
    this.debugData("one()", { sql, values });
    return db.one(sql, values, options);
  }

  async any(
    params?: QueryParams,
    options?: QueryOptions
  ) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(params);
    this.debugData("any()", { sql, values });
    return db.any(sql, values, options);
  }

  async all(
    params?: QueryParams,
    options: QueryOptions = { }
  ) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(params);
    this.debugData("all()", { sql, values });
    return db.all(sql, values, options);
  }

  async run(
    params?: QueryParams,
    options?: QueryOptions
  ) {
    const sql    = this.sql();
    const db     = this.lookupDatabase();
    const values = this.allValues(params);
    this.debugData("all()", { sql, values });
    return db.run(sql, values, { ...options, sanitizeResult: true });
  }

  contextValues() {
    const { setValues, whereValues, havingValues } = this.resolveChain();
    return { setValues, whereValues, havingValues };
  }

  allValues(where: AllValuesWhere=[]): BuilderValues {
    const { setValues, whereValues, havingValues } = this.resolveChain();

    // In the usual case we just get one set of extra args and they
    // go at the end.  But if there's some need to jiggle the parameters
    // more then a function can be provided.
    if (isFunction(where)) {
      return where(setValues, whereValues, havingValues);
    }
    return [...setValues, ...whereValues, ...havingValues, ...where]
  }

  setValues(...values) {
    if (values.length) {
      this.context.setValues = [
        ...this.context.setValues, ...values
      ];
    }
    return this.context.setValues;
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

  sql() {
    // to generate SQL we first generate a context containing all the
    // information collected from the query builder chain...
    const context = this.resolveChain();

    // ...then we call the generateSQL() static method on each class in
    // the order determined by their static buildOrder
    return Object.entries(Generators)
      // sort generators by the buildOrder - the second array element in the value
      .sort( (a, b) => a[1][1] - b[1][1] )
      // filter out any that don't have slots defined
      .filter( ([slot]) => context[slot] )
      // call the generateSQL() static method
      .map( ([slot, entry]) => entry[0].generateSQL(context[slot], context) )
      // filter out any that didn't return a value
      .filter( i => hasValue(i) )
      // join together into a single string
      .join(newline);
  }

  // resolve the complete chain from top to bottom
  resolveChain(): BuilderContext {
    return this.context || this.resolve(
      this.parent
        ? this.parent.resolveChain()
        : defaultContext()
    );
  }

  // resolve a link in the chain and merge into parent context
  resolve(context: BuilderContext, args={}) {
    const slot = this.slot;
    this.context = {
      ...context,
      ...args
    }
    const values = this.resolveLink();
    if (values && values.length) {
      this.context[slot] = [...(this.context[slot] || []), ...values];
    }
    return this.context;
  }

  // resolve a link in the chain
  resolveLink() {
    return this.args.map(
      (item: any) => (isObject(item) && (item as ObjectWithSql).sql)
        ? (item as ObjectWithSql).sql
        : this.resolveLinkItem(item)
    ).flat()
  }

  // resolve an individual argument for a link in the chain
  resolveLinkItem(item: any) {
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
    else if (noValue(item)) {
      return this.resolveLinkNothing(item);
    }
    fail("Invalid query builder value: ", item);
  }

  resolveLinkString(..._args: any[]): string | string[] | void {
    notImplemented("resolveLinkString()");
  }

  resolveLinkArray(_array: any[]) {
    notImplemented("resolveLinkArray()");
  }

  resolveLinkObject(_object: object) {
    notImplemented("resolveLinkObject()");
  }

  resolveLinkNothing(_nothing: any) {
    return [ ];
  }

  // utility methods
  lookup(key: string, error?: string) {
    return this[key] ||
      (this.parent
        ? this.parent.lookup(key)
        : fail(error || `Missing item in query chain: ${key}`))
  }

  lookupDatabase(): DatabaseInstance {
    return this.context.database || this.lookup('database');
  }

  lookupTable(): string {
    return this.context.table || this.lookup('table');
  }

  quote(item: string) {
    return this.lookupDatabase().quote(item) as string    // FIXME
  }

  quoteTableColumns(
    table: string,
    columns: string | string[],
    prefix?: string
  ): string[] {
    // function to map columns to depends on table and/or prefix being defined
    const func = table
      ? prefix
        ? (column: string) => this.quoteTableColumnAs(table, column, prefix + column)
        : (column: string) => this.quoteTableColumn(table, column)
      : prefix
        ? (column: string) => this.quoteColumnAs(column, prefix + column)
        : (column: string) => this.quote(column)
    ;
    // split string into items and apply function
    return splitList(columns).map(func) as string[];
  }

  tableColumn(table: string, column: string) {
    return column.match(/\./)
      ? column
      : `${table}.${column}`;
  }

  quoteTableColumn(table: string, column: string) {
    return this.quote(
      this.tableColumn(table, column)
    )
  }

  quoteTableAs(table: string, as: string) {
    return [
      this.quote(table),
      this.quote(as)
    ].join(' AS ');
  }

  quoteTableColumnAs(table: string, column: string, as: string) {
    return [
      this.quoteTableColumn(table, column),
      this.quote(as)
    ].join(' AS ')
  }

  quoteColumnAs(column: string, as: string) {
    return [
      this.quote(column),
      this.quote(as)
    ].join(' AS ')
  }

  errorMsg(msgFormat: string, args: Record<string, any> = { }) {
    const method = this.method || unknown;
    return this.error(
      format(
        this.messages?.[msgFormat] || fail("Invalid message format: ", msgFormat),
        { method, ...args }
      )
    )
  }

  toString() {
    return this.sql();
  }

  error(...args: any[]): never {
    const etype   = this.errorType || QueryBuilderError;
    throw new etype(args.join(''))
  }
}

export default Builder