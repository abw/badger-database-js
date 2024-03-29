import Record from "./Record.js";
import Queryable from "./Queryable.js";
import recordProxy from "./Proxy/Record.js";
import { databaseBuilder } from "./Builders.js";
import { isQuery } from "./Utils/Queries.js";
import { addDebugMethod } from "./Utils/Debug.js";
import { aliasMethods } from "./Utils/Methods.js";
import { prepareColumns, prepareKeys } from "./Utils/Columns.js";
import { throwColumnValidationError, unexpectedRowCount } from "./Utils/Error.js";
import { fail, firstValue, isArray, noValue, splitList } from "@abw/badger-utils";

const methodAliases = {
  insertRow:     "insertOneRow",
  insertRows:    "insertAllRows",
  insertRecord:  "insertOneRecord",
  insertRecords: "insertAllRecords",
  update:        "updateAll",
  updateRow:     "updateOneRow",
  fetch:         "fetchAll",
  fetchRecord:   "fetchOneRecord",
  fetchRecords:  "fetchAllRecords",
}

export class Table extends Queryable {
  constructor(database, config) {
    super(database.engine, config);
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
    this.build         = databaseBuilder(this.database);
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
  // Basic queries - insert
  //-----------------------------------------------------------------------------
  async insert(data, options) {
    return isArray(data, options)
      ? this.insertAll(data, options)
      : this.insertOne(data, options)
  }

  async prepareInsert(data, options) {
    const [cols, vals] = await this.validateInsert(data, options);
    const returning = this.engine.returning
      ? { table: this.table, columns: this.keys }
      : undefined;
    this.checkRequiredColumns(data);
    const insert = this.build
      .insert(cols)
      .into(this.table)
      .values(vals)
      .returning(returning);
    this.debugData('prepareInsert()', { data, sql: insert.sql() })
    return insert;
  }

  async validateInsert(data, options) {
    return this.checkWritableColumns(data, options);
  }

  async insertOne(data, options={}) {
    const insert = await this
      .prepareInsert(data, options)
      .then( query => query.run(undefined, { keys: this.keys }) );
    return this.inserted(data, insert, options);
  }

  async insertAll(data, options) {
    this.debugData("insertAll()", { data, options });
    let rows = [ ];
    for (const row of data) {
      rows.push(await this.insertOne(row, options));
    }
    return rows;
  }

  async insertOneRow(data, options) {
    this.debugData("insertOneRow()", { data, options });
    return this.insertOne(data, this.withReloadOption(options))
  }

  async insertAllRows(data, options) {
    this.debugData("insertAllRows()", { data, options });
    return this.insertAll(data, this.withReloadOption(options))
  }

  async insertOneRecord(data, options) {
    this.debugData("insertOneRecord()", { data, options });
    return this.insertOne(data, this.withRecordOption(options))
  }

  async insertAllRecords(data, options) {
    this.debugData("insertAllRecords()", { data, options });
    return this.insertAll(data, this.withRecordOption(options))
  }

  async inserted(input, output, options={}) {
    return options.reload || options.record
      ? this.insertReload(input, output, options)
      : output;
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


  //-----------------------------------------------------------------------------
  // update
  //-----------------------------------------------------------------------------
  async prepareUpdate(set, where, options) {
    const [update, criteria] = await this.validateUpdate(set, where, options);
    const query = this
      .build
      .update(this.table)
      .set(update)
      .where(criteria);
    const sql = query.sql();
    this.debugData("prepareUpdate()", { where, sql })
    return query
  }

  async validateUpdate(set, where, options) {
    const [ , , update] = this.checkUpdatableColumns(set, options);
    const [ , , criteria] = this.checkWhereColumns(where, options);
    return [update, criteria]
  }

  async updateOne(set, where, options={}) {
    this.debugData("updateOne()", { set, where, options });
    const update = await this
      .prepareUpdate(set, where, options)
      .then( query => query.run() );
    return update.changes === 1
      ? this.updated(set, where, update, options)
      : unexpectedRowCount(update.changes, 'updated');
  }

  async updateAny(set, where, options={}) {
    this.debugData("updateAny()", { set, where, options });
    const update = await this
      .prepareUpdate(set, where, options)
      .then( query => query.run() )
    if (update.changes > 1) {
      return unexpectedRowCount(update.changes, 'updated');
    }
    else if (update.changes === 1) {
      return this.updated(set, where, update, options)
    }
    else {
      return options.reload
        ? undefined
        : update;
    }
  }

  async updateAll(set, where, options={}) {
    this.debugData("updateAllRows()", { set, where, options });
    const update = await this
      .prepareUpdate(set, where, options)
      .then( query => query.run() );
    return options.reload
      ? fail("Cannot reload multiple updated rows")
      : update;
  }

  async updateOneRow(set, where, options) {
    this.debugData("updateOneRow()", { set, where, options });
    return this.updateOne(set, where, this.withReloadOption(options))
  }

  async updateAnyRow(set, where, options) {
    this.debugData("updateAnyRow()", { set, where, options });
    return this.updateAny(set, where, this.withReloadOption(options))
  }

  async updated(set, where, result, options) {
    return options.reload
      ? this.updateReload(set, where, options)
      : result;
  }

  async updateReload(set, where, options) {
    // For update queries things are a little more complicated.  In the
    // usual case we can reload the rows using the original selection
    // criteria (where).  But we might have done an update which changes
    // that selection criteria (set), so we should use those values instead.
    const fetch = { };
    Object.keys(where).map(
      key => fetch[key] = firstValue(set[key], where[key])
    );
    return this.oneRow(fetch, options);
  }

  //-----------------------------------------------------------------------------
  // delete
  //-----------------------------------------------------------------------------
  async delete(where, options) {
    this.debugData("delete()", { where });
    const criteria = await this.validateDelete(where, options)
    const query = this
      .build
      .delete()
      .from(this.table)
      .where(criteria)
    const sql = query.sql();
    this.debugData("delete()", { where, sql })
    const result = await query.run();
    return this.deleted(where, result, options)
  }

  async validateDelete(where, options) {
    const [ , , criteria] = this.checkWhereColumns(where, options);
    return criteria;
  }

  async deleted(where, result) {
    return result;
  }

  //-----------------------------------------------------------------------------
  // fetch - using where data
  //-----------------------------------------------------------------------------
  prepareFetch(where, options) {
    const table = this.table;
    const columns = options.columns || Object.keys(this.columns);
    this.checkColumnNames(columns);
    const [ , , criteria] = this.checkWhereColumns(where, options);
    const query = this
      .select({ table, columns })
      .where(criteria)
      .order(options.orderBy || options.order);
    const sql = query.sql();
    this.debugData("prepareFetch()", { where, sql })
    return query
  }

  async fetchOne(where, options={}) {
    this.debugData("fetchOne()", { where, options });
    const row = await this.prepareFetch(where, options).one();
    return this.loadedOne(row, options);
  }

  async fetchAny(where, options={}) {
    this.debugData("fetchAny()", { where, options });
    const row = await this.prepareFetch(where, options).any();
    return row
      ? this.loadedOne(row, options)
      : undefined;
  }

  async fetchAll(where, options={}) {
    this.debugData("fetchAllRows()", { where, options });
    const rows = await this.prepareFetch(where, options).all();
    return this.loadedAll(rows, options);
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

  loaded(row, options={}) {
    return options.record
      ? this.record(row)
      : row;
  }

  loadedOne(row, options={}) {
    return this.loaded(row, options);
  }

  loadedAny(row, options={}) {
    return row
      ? this.loaded(row, options)
      : undefined;
  }

  loadedAll(rows, options={}) {
    return Promise.all(
      rows.map( row => this.loaded(row, options) )
    );
  }

  withReloadOption(options={}) {
    return { ...options, reload: true };
  }

  withRecordOption(options={}) {
    return { ...options, record: true };
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

  checkColumns(data={}, options={}, cols=[], vals=[]) {
    this.debugData("checkColumns()", { data, options})
    const table = this.table;
    let result = { };
    // check that all the values supplied correspond to valid columns
    Object.keys(data).forEach(
      column => {
        const spec = this.columns[column];
        if (spec) {
          if (options.writable && spec.readonly) {
            throwColumnValidationError('readonly', { column, table });
          }
          if (options.fixed && spec.fixed) {
            throwColumnValidationError('fixed', { column, table });
          }
          // cols.push(options.tableColumn ? spec.tableColumn : spec.column);
          cols.push(spec.column);
          vals.push(data[column]);
          result[spec.column] = data[column];
        }
        else if (! options.pick) {
          throwColumnValidationError('unknown', { column, table });
        }
      }
    )
    this.debugData("checkColumns()", { cols, vals })
    return [cols, vals, result];
  }

  checkWritableColumns(data, options={}) {
    return this.checkColumns(data, { ...options, writable: true })
  }

  checkUpdatableColumns(data, options={}) {
    return this.checkColumns(data, { ...options, writable: true, fixed: true })
  }

  checkWhereColumns(where, options) {
    return this.checkColumns(where, options)
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
  // Query builder methods
  //-----------------------------------------------------------------------------
  select(...args) {
    if (args.length === 0) {
      args.push({
        table:   this.table,
        columns: Object.keys(this.columns)
      })
    }
    return this.build.select(...args).from(this.table)
  }

  //-----------------------------------------------------------------------------
  // Record methods
  //-----------------------------------------------------------------------------
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

  //-----------------------------------------------------------------------------
  // Utility methods
  //-----------------------------------------------------------------------------
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

}

export default Table;
