import recordProxy from "./Proxy/Record.js";
import rowProxy from "./Proxy/Row.js";
import rowsProxy from "./Proxy/Rows.js";
import Record from "./Record.js";
import Queries from "./Queries.js";
// import Schema from "./Schema.js";
import { fail, hasValue, isArray, noValue, splitList } from "@abw/badger-utils";
import { prepareColumns, prepareKeys } from "./Utils/Columns.js";
import { throwColumnValidationError } from "./Utils/Error.js";
import { addDebugMethod } from "./Utils/Debug.js";

export class Table {
  constructor(database, schema) {
    this.database      = database || fail("No database specified");
    this.engine        = database.engine;
    //this.schema        = new Schema(database, schema)
    this.table         = schema.table;
    this.columns       = prepareColumns(schema);
    this.readonly      = Object.keys(this.columns).filter( key => this.columns[key].readonly );
    this.required      = Object.keys(this.columns).filter( key => this.columns[key].required );
    this.keys          = prepareKeys(schema, this.columns);
    this.id            = schema.id;
    this.recordClass   = schema.recordClass || Record;
    this.recordOptions = schema.recordOptions;
    this.rowProxy      = rowProxy(this);
    this.rowsProxy     = rowsProxy(this);
    this.fragments     = this.prepareFragments(schema);
    this.queries       = new Queries({ ...schema, debugPrefix: `Queries ${this.table}> ` });
    addDebugMethod(this, 'table', { debugPrefix: `Table ${this.table}> ` }, schema);
  }
  prepareFragments(schema) {
    const quote       = this.database.quote.bind(this.database);
    const fragments   = schema.fragments ||= { };
    fragments.table   = quote(this.table);
    fragments.columns = Object.values(this.columns).map(
      spec => quote(spec.tableColumn)
    ).join(', ');
    return fragments;
  }

  //-----------------------------------------------------------------------------
  // Column validation
  //-----------------------------------------------------------------------------
  checkColumnNames(names) {
    const table = this.table;
    splitList(names).forEach(
      column => this.columns[column]
          || throwColumnValidationError('unknown', { column, table })
    )
  }
  checkColumns(data={}, cols=[], vals=[], test={}) {
    const table = this.table;
    // check that all the values supplied correspond to valid columns
    Object.keys(data).forEach(
      column => {
        const spec = this.columns[column]
          || throwColumnValidationError('unknown', { column, table });
        if (test.writable && spec.readonly) {
          throwColumnValidationError('readonly', { column, table });
        }
        cols.push(spec.column);
        vals.push(data[column])
      }
    )
    return [cols, vals];
  }
  checkWritableColumns(data, cols=[], vals=[]) {
    // check that all the values supplied correspond to valid columns that are not readonly
    return this.checkColumns(data, cols, vals, { writable: true })
  }
  checkRequiredColumns(data) {
    const table = this.table;
    this.required.forEach(
      column => {
        if (noValue(data[column])) {
          throwColumnValidationError('required', { column, table });
        }
      }
    );
  }

  //-----------------------------------------------------------------------------
  // Engine methods
  //-----------------------------------------------------------------------------
  query(name) {
    return this.queries.query(name);
  }
  run(query, params, options) {
    return this.engine.run(this.query(query), params, options)
  }
  any(query, params, options) {
    return this.engine.any(this.query(query), params, options)
  }
  all(query, params, options) {
    return this.engine.all(this.query(query), params, options)
  }
  one(query, params, options) {
    return this.engine.one(this.query(query), params, options)
  }

  //-----------------------------------------------------------------------------
  // Basic queries - insert
  //-----------------------------------------------------------------------------
  async insert(data, options) {
    return isArray(data, options)
      ? this.insertAll(data, options)
      : this.insertOne(data, options)
  }
  async insertOne(data, options={}) {
    this.debug("insertOne: ", data);
    const [cols, vals] = this.checkWritableColumns(data);
    this.checkRequiredColumns(data);
    const insert = await this.engine.insert(this.table, cols, vals, this.keys);

    // the reload option can be set false to prevent a reload
    if (hasValue(options.reload) && ! options.reload) {
      return insert;
    }

    // otherwise we reload the record using the id/keys
    const fetch = { };
    this.keys.map(
      key => fetch[key] = insert[key] || data[key]
    );
    // console.log('post-insert fetch: ', fetch);

    return this.fetchOne(fetch);
  }
  async insertAll(data, options) {
    this.debug("insertAll: ", data);
    return await Promise.all(
      data.map(
        async row => this.insert(row, options)
      )
    );
  }

  //-----------------------------------------------------------------------------
  // update
  //-----------------------------------------------------------------------------
  async update(data, where) {
    this.debug("update: ", data, where);
    const [dcols, dvals] = this.checkWritableColumns(data);
    const [wcols, wvals] = this.checkColumns(where);
    return this.engine.update(this.table, dcols, dvals, wcols, wvals);
  }

  //-----------------------------------------------------------------------------
  // delete
  //-----------------------------------------------------------------------------
  async delete(where) {
    this.debug("delete: ", where);
    const [cols, vals] = this.checkColumns(where);
    return this.engine.delete(this.table, cols, vals);
  }

  //-----------------------------------------------------------------------------
  // fetch
  //-----------------------------------------------------------------------------
  prepareFetch(where, options={}) {
    if (options.columns) {
      this.checkColumnNames(options.columns);
    }
    return this.checkColumns(where);
  }
  async fetchOne(where, options={}) {
    this.debug("fetchOne: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectOne(this.table, wcols, wvals, options);
  }
  async fetchAny(where, options={}) {
    this.debug("fetchAny: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectAny(this.table, wcols, wvals, options);
  }
  async fetchAll(where, options={}) {
    this.debug("fetchAll: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectAll(this.table, wcols, wvals, options);
  }

  // select() is the old name for fetchAll() which I'm in the process of
  // reworking.
  async select(where, options={}) {
    this.debug("select: ", where, options);
    if (options.columns) {
      this.checkColumnNames(options.columns);
    }
    const [wcols, wvals] = this.checkColumns(where);
    return this.engine.select(this.table, wcols, wvals, options);
  }

  //-----------------------------------------------------------------------------
  // Old Knex-based code - TODO
  //-----------------------------------------------------------------------------
  selectRow(columns) {
    return this.rowProxy(
      this.knex().select(
        this.schema.columns(columns)
      )
    ).first();
  }
  selectRows(columns) {
    return this.rowsProxy(
      this.knex().select(
        this.schema.columns(columns)
      )
    );
  }
  fetchRow(where) {
    const select = this.knex().select().first();
    return this.rowProxy(
      where
        ? select.where(where)
        : select
    );
  }
  fetchRows(where) {
    const select = this.knex().select();
    return this.rowsProxy(
      where
        ? select.where(where)
        : select
    );
  }
  OLDupdate(set, where) {
    return this.rowsProxy(
      this.knex().update(set).where(where).then(
        () => this.fetchRows(where)
      )
    )
  }
  record(query) {
    return query.then(
      row => recordProxy(new this.recordClass(this, row, this.recordOptions))
    );
  }
  records(query) {
    // console.log('table.records()');
    return query.then(
      rows => rows.map( row => recordProxy(new this.recordClass(this, row, this.recordOptions)) )
    );
  }
  tableFragments() {
    return this.tableFragments
  }
}

export const table = (database, schema) =>
  new Table(database, schema)

export default Table;
