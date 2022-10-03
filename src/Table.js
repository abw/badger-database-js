import Queries from "./Queries.js";
import Record from "./Record.js";
import rowProxy from "./Proxy/Row.js";
import rowsProxy from "./Proxy/Rows.js";
import recordProxy from "./Proxy/Record.js";
// import Schema from "./Schema.js";
import { fail, isArray, noValue, splitList } from "@abw/badger-utils";
import { prepareColumns, prepareKeys } from "./Utils/Columns.js";
import { throwColumnValidationError, unexpectedRowCount } from "./Utils/Error.js";
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
    return options.reload
      ? this.reload(data, insert)
      : insert;
  }
  async insertAll(data, options) {
    this.debug("insertAll: ", data);
    let rows = [ ];
    for (const row of data) {
      rows.push(await this.insertOne(row, options));
    }
    return rows;
  }

  //-----------------------------------------------------------------------------
  // update
  //-----------------------------------------------------------------------------
  prepareUpdate(set, where) {
    const [dcols, dvals] = this.checkWritableColumns(set);
    const [wcols, wvals] = this.checkColumns(where);
    return [dcols, dvals, wcols, wvals];
  }
  async update(...args) {
    return this.updateAll(...args);
  }
  async updateOne(set, where, options={}) {
    this.debug("updateOne: ", set, where);
    const args = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    if (update.changes !== 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    return options.reload
      ? this.reload(set, where)
      : update;
  }
  async updateAny(set, where, options={}) {
    this.debug("updateAny: ", set, where);
    const args = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    if (update.changes > 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    return options.reload
      ? this.reload(set, where)
      : update;
  }
  async updateAll(set, where, options={}) {
    this.debug("updateAll: ", set, where);
    const args   = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    // return update;
    //let rows = [ ];
    //for (const row of data) {
    //  rows.push(await this.insertOne(row, options));
    //}
    //return rows;
    return options.reload
      ? fail("Cannot reload multiple updated rows")
      : update;
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
  // oneRow(), anyRow() and allRows()
  //-----------------------------------------------------------------------------
  prepareFetch(where, options={}) {
    if (options.columns) {
      this.checkColumnNames(options.columns);
    }
    return this.checkColumns(where);
  }
  async oneRow(where, options={}) {
    this.debug("oneRow: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectOne(this.table, wcols, wvals, options);
  }
  async anyRow(where, options={}) {
    this.debug("anyRow: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectAny(this.table, wcols, wvals, options);
  }
  async allRows(where, options={}) {
    this.debug("allRows: ", where, options);
    const [wcols, wvals] = this.prepareFetch(where, options);
    return this.engine.selectAll(this.table, wcols, wvals, options);
  }

  //-----------------------------------------------------------------------------
  // oneRecord(), anyRecord() and allRecords()
  //-----------------------------------------------------------------------------
  async oneRecord(where, options={}) {
    this.debug("oneRecord: ", where, options);
    const row = await this.oneRow(where, options);
    return this.record(row);
  }
  async anyRecord(where, options={}) {
    this.debug("anyRecord: ", where, options);
    const row = await this.anyRow(where, options);
    return row
      ? this.record(row)
      : row;
  }
  async allRecords(where, options={}) {
    this.debug("allRecords: ", where, options);
    const rows = await this.allRows(where, options);
    return this.records(rows);
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

  tableFragments() {
    return this.tableFragments
  }
  identity(data) {
    return this.keys.reduce(
      (result, key) => {
        result[key] = data[key]
        return result
      },
      {}
    );
  }
  async reload(input, output) {
    // for insert and update queries where the input data is used
    // to run the query, and the output data is returned from the
    // query
    const fetch = { };
    this.keys.map(
      key => fetch[key] = output[key] || input[key]
    );
    return this.oneRow(fetch);
  }
  newRecord(row) {
    return recordProxy(
      new this.recordClass(this, row, this.recordOptions)
    );
  }
  record(row) {
    this.debug("record()", row);
    return Promise.resolve(
      this.newRecord(row, this.recordOptions)
    );
  }
  records(rows) {
    this.debug("records()", rows);
    return Promise.resolve(
      rows.map(
        row => this.newRecord(row)
      )
    );
  }
}

export default Table;
