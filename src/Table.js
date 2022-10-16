import Record from "./Record.js";
import recordProxy from "./Proxy/Record.js";
import { fail, firstValue, isArray, noValue, splitList } from "@abw/badger-utils";
import { prepareColumns, prepareKeys } from "./Utils/Columns.js";
import { throwColumnValidationError, unexpectedRowCount } from "./Utils/Error.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { isQuery } from "./Utils/Queries.js";
import Queryable from "./Queryable.js";
import { aliasMethods } from "./Utils/Methods.js";

const methodAliases = {
  insertRecord:  "insertOneRecord",
  insertRecords: "insertAllRecords",
  update:        "updateAll",
  fetch:         "fetchAll",
  fetchRecord:   "fetchOneRecord",
  fetchRecords:  "fetchAllRecords",
}

export class Table extends Queryable {
  constructor(database, config) {
    super(database.engine);
    this.config        = this.configure(config) || config;
    this.database      = database || fail("No database specified");
    this.table         = config.table;
    this.columns       = prepareColumns(config);
    this.readonly      = Object.keys(this.columns).filter( key => this.columns[key].readonly );
    this.required      = Object.keys(this.columns).filter( key => this.columns[key].required );
    this.keys          = prepareKeys(config, this.columns);
    this.id            = config.id;
    this.recordClass   = config.recordClass || Record;
    this.recordConfig  = config.recordConfig;
    this.queries       = config.queries || { };
    this.fragments     = this.prepareFragments(config);
    this.relations     = config.relations || { };
    this.build         = this.database.build;
    this.selectFrom    = this.build.select({
      table:   this.table,
      columns: Object.keys(this.columns)
    }).from(this.table)

    aliasMethods(this, methodAliases);
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
  // Basic queries - insert
  //-----------------------------------------------------------------------------
  async insert(data, options) {
    return isArray(data, options)
      ? this.insertAll(data, options)
      : this.insertOne(data, options)
  }
  async insertOne(data, options={}) {
    this.debugData("insertOne()", { data, options });
    const [cols, vals] = this.checkWritableColumns(data);
    this.checkRequiredColumns(data);
    const insert = await this.engine.insert(this.table, cols, vals, this.keys);
    return options.reload || options.record
      ? this.insertReload(data, insert, options)
      : insert;
  }
  async insertAll(data, options) {
    this.debugData("insertAll()", { data, options });
    let rows = [ ];
    for (const row of data) {
      rows.push(await this.insertOne(row, options));
    }
    return rows;
  }
  async insertOneRecord(data, options) {
    this.debugData("insertOneRecord()", { data, options });
    return this.insertOne(data, this.withRecordOption(options))
  }
  async insertAllRecords(data, options) {
    this.debugData("insertAllRecords()", { data, options });
    return this.insertAll(data, this.withRecordOption(options))
  }

  //-----------------------------------------------------------------------------
  // update
  //-----------------------------------------------------------------------------
  prepareUpdate(set, where) {
    const [dcols, dvals] = this.checkWritableColumns(set);
    const [wcols, wvals] = this.checkWhereColumns(where);
    return [dcols, dvals, wcols, wvals];
  }
  async updateOne(set, where, options={}) {
    this.debugData("updateOne()", { set, where, options });
    const args = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
    if (update.changes !== 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    return options.reload
      ? this.updateReload(set, where)
      : update;
  }
  async updateAny(set, where, options={}) {
    this.debugData("updateAny()", { set, where, options });
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
  async updateAll(set, where, options={}) {
    this.debugData("updateAllRows()", { set, where, options });
    const args   = this.prepareUpdate(set, where);
    const update = await this.engine.update(this.table, ...args);
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
  // fetch - using where data
  //-----------------------------------------------------------------------------
  prepareFetch(where, params) {
    params.columns ||= Object.keys(this.columns);
    this.checkColumnNames(params.columns);
    return this.checkWhereColumns(where);
  }
  async fetchOne(where, options={}) {
    this.debugData("fetchOne()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const row = await this.engine.selectOne(this.table, wcols, wvals, params);
    return options.record
      ? this.record(row)
      : row;
  }
  async fetchAny(where, options={}) {
    this.debugData("fetchAny()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const row = await this.engine.selectAny(this.table, wcols, wvals, params);
    return row
      ? options.record
        ? this.record(row)
        : row
      : undefined;
  }
  async fetchAll(where, options={}) {
    this.debugData("fetchAllRows()", { where, options });
    const params = { ...options };
    const [wcols, wvals] = this.prepareFetch(where, params);
    const rows = await this.engine.selectAll(this.table, wcols, wvals, params);
    return options.record
      ? this.records(rows)
      : rows;
  }
  async fetchOneRecord(where, options) {
    this.debugData("fetchOneRecord()", { where, options });
    return this.fetchOne(where, this.withRecordOption(options));
  }
  async fetchAnyRecord(where, options) {
    this.debugData("fetchAnyRecord()", { where, options });
    return this.fetchAny(where, this.withRecordOption(options));
  }
  async fetchAllRecords(where, options) {
    this.debugData("fetchAllRecords()", { where, options });
    return this.fetchAll(where, this.withRecordOption(options));
  }

  //-----------------------------------------------------------------------------
  // Generic methods map onto equivalent fetch or select methods depending on
  // first arguments.  If it's a query (string or builder) then it's forwarded
  // to the select method, otherwise to the fetch method.
  //-----------------------------------------------------------------------------
  async oneRow(query, ...args) {
    this.debugData("oneRow()", { query, args });
    return isQuery(query)
      ? this.one(query, ...args)
      : this.fetchOne(query, ...args)
  }
  async anyRow(query, ...args) {
    this.debugData("anyRow()", { query, ...args });
    return isQuery(query)
      ? this.any(query, ...args)
      : this.fetchAny(query, ...args)
  }
  async allRows(query, ...args) {
    this.debugData("allRows()", { query, ...args });
    return isQuery(query)
      ? this.all(query, ...args)
      : this.fetchAll(query, ...args)
  }
  async oneRecord(query, ...args) {
    this.debugData("oneRecord()", { query, args });
    return isQuery(query)
      ? this.one(query, args[0], this.withRecordOption(args[1]))
      : this.fetchOne(query, this.withRecordOption(args[0]))
  }
  async anyRecord(query, ...args) {
    this.debugData("anyRecord()", { query, args });
    return isQuery(query)
      ? this.any(query, args[0], this.withRecordOption(args[1]))
      : this.fetchAny(query, this.withRecordOption(args[0]))
  }
  async allRecords(query, ...args) {
    this.debugData("allRecords()", { query, args });
    return isQuery(query)
      ? this.all(query, args[0], this.withRecordOption(args[1]))
      : this.fetchAll(query, this.withRecordOption(args[0]))
  }

  loadedOne(row, options={}) {
    return options.record
      ? this.record(row)
      : row;
  }
  loadedAny(row, options={}) {
    return row
      ? this.loadedOne(row, options)
      : undefined;
  }
  loadedAll(rows, options={}) {
    return options.record
      ? this.records(rows)
      : rows;
  }
  withRecordOption(options={}) {
    return { ...options, record: true };
  }

  select(...args) {
    return this.build.select(...args);
  }
  from(...args) {
    return this.build.from(...args);
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
