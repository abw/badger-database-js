import { addDebug } from "@abw/badger";
import { fail, isObject, isString } from "@abw/badger-utils";
import recordProxy from "./Proxy/Record.js";
import rowProxy from "./Proxy/Row.js";
import rowsProxy from "./Proxy/Rows.js";
import Record from "./Record.js";
import Schema from "./Schema.js";
// import Queries from "./Queries.js";

// export class Table extends Queries {
export class Table {
  constructor(database, schema) {
    this.database = database || fail("No database specified");
    this.schema   = new Schema(database, schema)

    this.recordClass = schema.record || Record;
    this.rowProxy = rowProxy(this);
    this.rowsProxy = rowsProxy(this);

    addDebug(this, schema.debug, schema.debugPrefix || `${this.table} table`, schema.debugColor);
  }
  query() {
    return this.database.query(this.schema.table);
  }
  insert(data) {
    return this.query().insert(data);
  }
  fetch() {
    const first = this.query().first();
    return this.rowProxy(
      arguments.length
        ? first.where(...arguments)
        : first
    );
  }
  fetchAll() {
    const select = this.query().select();
    return this.rowsProxy(
      arguments.length
        ? select.where(...arguments)
        : select
    );
  }
  fetchOne() {
    return this.fetchAll(...arguments).then(
      rows => rows.length === 1
        ? rows[0]
        : fail(`fetchOne for ${this.schema.table} returned ${rows.length} records`)
    )
  }
  selectArgs(...args) {
    // console.log('selectArgs: ', args);
    if (args.length === 1 && isObject(args[0])) {
      return {
        ...args[0],
        columns: this.schema.columns(args[0].columns)
      }
    }
    else if (isString(args[0])) {
      return {
        columns: this.schema.columns(args[0]),
        where:   args[1]
      }
    }
  }
  select() {
    const args = this.selectArgs(...arguments);
    const select = this.query().select(args.columns).first();
    //return args.where
    //  ? select.where(args.where)
    //  : select;
    return this.rowProxy(
      args.where
        ? select.where(args.where)
        : select
    );
  }
  selectAll() {
    const args = this.selectArgs(...arguments);
    const select = this.query().select(args.columns);
    return this.rowsProxy(
      args.where
        ? select.where(args.where)
        : select
    );
  }
  selectOne() {
    return this.selectAll(...arguments).then(
      rows => rows.length === 1
        ? rows[0]
        : fail(`selectOne for ${this.schema.table} returned ${rows.length} records`)
    )
  }
  fetchAllProxy() {
    const select = this.query().select();
    return arguments.length
      ? this.proxyRows(select.where(...arguments))
      : this.proxyRows(select);
  }
  proxyRows(query) {
    // console.log('creating new proxy for query: ', query);
    // console.log('creating new proxy with handler: ', this.rowsProxy);
    return new Proxy(query, this.rowsProxy);
  }
  record(query) {
    return query.then(
      row => recordProxy(new this.recordClass(this, row))
    );
  }
  records(query) {
    return query.then(
      rows => rows.map( row => recordProxy(new this.recordClass(this, row)) )
    );
  }

  //fetch(query);
  //  this.query().insert();
  /*
  all(...args) {
    return this.select().where(...args);
  }
  any(...args) {
    return this.all(...args).first();
  }
  one(...args) {
    return this.all(...args).then(
      rows => {
        if (rows.length === 1) {
          return rows[0];
        }
        else {
          throw new Error(`Query for one ${this.schema.table} returned ${rows.length} records`);
        }
      }
    );
  }
  */
}

export const table = (database, schema) => new Table(database, schema)

export default Table;
