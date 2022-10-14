import Queries from "./Queries.js";
import Record from "./Record.js";
import recordProxy from "./Proxy/Record.js";
import { fail, firstValue, isArray, noValue, splitList } from "@abw/badger-utils";
import { prepareColumns, prepareKeys } from "./Utils/Columns.js";
import { throwColumnValidationError, unexpectedRowCount } from "./Utils/Error.js";
import { addDebugMethod } from "./Utils/Debug.js";

export class Table {
  constructor(database, config) {
    this.config        = this.configure(config) || config;
    this.database      = database || fail("No database specified");
    this.engine        = database.engine;
    this.table         = config.table;
    this.columns       = prepareColumns(config);
    this.readonly      = Object.keys(this.columns).filter( key => this.columns[key].readonly );
    this.required      = Object.keys(this.columns).filter( key => this.columns[key].required );
    this.keys          = prepareKeys(config, this.columns);
    this.id            = config.id;
    this.recordClass   = config.recordClass || Record;
    this.recordConfig  = config.recordConfig;
    this.fragments     = this.prepareFragments(config);
    this.relations     = config.relations || { };
    this.queries       = new Queries(this.engine, { ...config, debugPrefix: `Queries:${this.table}` });
    this.build         = this.database.build;

    // method aliases
    this.insertRow     = this.insertOneRow;
    this.insertRows    = this.insertAllRows;
    this.insertRecord  = this.insertOneRecord;
    this.insertRecords = this.insertAllRecords;
    this.updateRow     = this.updateOneRow;
    this.updateRows    = this.updateAllRows;
    addDebugMethod(this, 'table', { debugPrefix: `Table:${this.table}` }, config);
  }
  configure(config) {
    return config;
  }
  prepareFragments(config) {
    const quote       = this.database.quote.bind(this.database);
    const fragments   = config.fragments ||= { };
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
  checkColumns(data={}, cols=[], vals=[], options={}) {
    const table = this.table;
    // check that all the values supplied correspond to valid columns
    Object.keys(data).forEach(
      column => {
        const spec = this.columns[column]
          || throwColumnValidationError('unknown', { column, table });
        if (options.writable && spec.readonly) {
          throwColumnValidationError('readonly', { column, table });
        }
        // cols.push(options.tableColumn ? spec.tableColumn : spec.column);
        cols.push(spec.column);
        vals.push(data[column])
      }
    )
    return [cols, vals];
  }
  checkWritableColumns(data, cols=[], vals=[]) {
    return this.checkColumns(data, cols, vals, { writable: true })
  }
  checkWhereColumns(...args) {
    return this.checkColumns(...args)
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
    this.debugData("run()", { query, params, options });
    return this.engine.run(this.query(query), params, options)
  }
  any(query, params, options) {
    this.debugData("any()", { query, params, options });
    return this.engine.any(this.query(query), params, options)
  }
  all(query, params, options) {
    this.debugData("all()", { query, params, options });
    return this.engine.all(this.query(query), params, options)
  }
  one(query, params, options) {
    this.debugData("one()", { query, params, options });
    return this.engine.one(this.query(query), params, options)
  }

  //-----------------------------------------------------------------------------
  // Basic queries - insert
  //-----------------------------------------------------------------------------
  async insert(data, options) {
    return isArray(data, options)
      ? this.insertAllRows(data, options)
      : this.insertOneRow(data, options)
  }
  async insertOneRow(data, options={}) {
    this.debugData("insertOneRow()", { data, options });
    const [cols, vals] = this.checkWritableColumns(data);
    this.checkRequiredColumns(data);
    const insert = await this.engine.insert(this.table, cols, vals, this.keys);
    return options.reload || options.record
      ? this.insertReload(data, insert, options)
      : insert;
  }
  async insertAllRows(data, options) {
    this.debugData("insertAllRows()", { data, options });
    let rows = [ ];
    for (const row of data) {
      rows.push(await this.insertOneRow(row, options));
    }
    return rows;
  }
  async insertOneRecord(data, options={}) {
    this.debugData("insertOneRecord()", { data, options });
    return this.insertOneRow(data, { ...options, record: true })
  }
  async insertAllRecords(data, options={}) {
    this.debugData("insertAllRecords()", { data, options });
    return this.insertAllRows(data, { ...options, record: true })
  }
  //-----------------------------------------------------------------------------
  // update
  //-----------------------------------------------------------------------------
  prepareUpdate(set, where) {
    const [dcols, dvals] = this.checkWritableColumns(set);
    const [wcols, wvals] = this.checkWhereColumns(where);
    return [dcols, dvals, wcols, wvals];
  }
  async update(...args) {
    return this.updateAllRows(...args);
  }
  async updateOneRow(set, where, options={}) {
    this.debugData("updateOneRow()", { set, where, options });
    const args = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    if (update.changes !== 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    return options.reload
      ? this.updateReload(set, where)
      : update;
  }
  async updateAnyRow(set, where, options={}) {
    this.debugData("updateAnyRow()", { set, where, options });
    const args = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    if (update.changes > 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    return options.reload
      ? update.changes === 1
        ? this.updateReload(set, where)
        : undefined
      : update;
  }
  async updateAllRows(set, where, options={}) {
    this.debugData("updateAllRows()", { set, where, options });
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
    this.debugData("delete()", { where });
    const [cols, vals] = this.checkWhereColumns(where);
    return this.engine.delete(this.table, cols, vals);
  }

  //-----------------------------------------------------------------------------
  // oneRow(), anyRow() and allRows()
  //-----------------------------------------------------------------------------
  prepareFetch(where, params) {
    params.columns ||= Object.keys(this.columns);
    this.checkColumnNames(params.columns);
    return this.checkWhereColumns(where);
  }
  async oneRow(where, options={}) {
    this.debugData("oneRow()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const row = await this.engine.selectOne(this.table, wcols, wvals, params);
    return options.record
      ? this.record(row)
      : row;
  }
  async anyRow(where, options={}) {
    this.debugData("anyRow()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const row = await this.engine.selectAny(this.table, wcols, wvals, params);
    return row
      ? options.record
        ? this.record(row)
        : row
      : undefined;
  }
  async allRows(where, options={}) {
    this.debugData("allRows()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const rows = await this.engine.selectAll(this.table, wcols, wvals, params);
    return options.record
      ? this.records(rows)
      : rows;
  }

  //-----------------------------------------------------------------------------
  // oneRecord(), anyRecord() and allRecords()
  //-----------------------------------------------------------------------------
  async oneRecord(where, options={}) {
    this.debugData("oneRecord()", { where, options });
    return this.oneRow(where, { ...options, record: true });
  }
  async anyRecord(where, options={}) {
    this.debugData("anyRecord()", { where, options });
    return this.anyRow(where, { ...options, record: true });
  }
  async allRecords(where, options={}) {
    this.debugData("allRecords()", { where, options });
    return this.allRows(where, { ...options, record: true });
  }

  select(...args) {
    return this.build.from(this.table).select(...args);
  }
  // EEK!  this.columns() is already defined
  //columns(...args) {
  //  return this.builder().from(this.table).columns(...args);
  //}

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
  async insertReload(input, output, options={}) {
    // For insert queries where the input data is used to run the query,
    // and the output data is returned from the query. We should have
    // values for each of this.keys because they should always be
    // either specified in the input data, or returned by the database
    const fetch = { };
    this.keys.map(
      key => fetch[key] = firstValue(output[key], input[key])
    );
    return options.record
      ? this.oneRecord(fetch)
      : this.oneRow(fetch);
  }
  async updateReload(set, where) {
    // For update queries things are a little more complicated.  In the
    // usual case we can reload the rows using the original selection
    // criteria (where).  But we might have done an update which changes
    // that selection criteria (set), so we should use those values instead.
    const fetch = { };
    Object.keys(where).map(
      key => fetch[key] = firstValue(set[key], where[key])
    );
    return this.oneRow(fetch);
  }
  newRecord(row) {
    return recordProxy(
      new this.recordClass(this, row, this.recordConfig)
    );
  }
  record(row) {
    this.debugData("record()", { row });
    return Promise.resolve(
      this.newRecord(row)
    );
  }
  records(rows) {
    this.debugData("records()", { rows });
    return Promise.resolve(
      rows.map(
        row => this.newRecord(row)
      )
    );
  }
}

export default Table;
