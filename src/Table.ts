import RecordClass from './Record.js'
import Queryable from './Queryable'
import recordProxy from './Proxy/Record.js'
import { databaseBuilder } from './Builders'
import { fail, firstValue, isArray, noValue, splitList } from '@abw/badger-utils'
import {
  isQuery, addDebugMethod, aliasMethods, prepareColumns, prepareKeys,
  throwColumnValidationError, unexpectedRowCount
} from './Utils'
import { CheckColumnsOptions, CheckedColumnsData, DatabaseInstance, DeleteOptions, DeleteResult, FetchOptions, InsertOptions, InsertResult, BuilderInstance, QueryOptions, QueryParams, RecordConfig, RecordConstructor, RelationsConfig, TableColumns, TableSpec, UpdateOptions, UpdateResult, QueryRow, TableConfig, NamedQuery, QuerySource, NamedQueries, TableInstance } from './types'
import { SelectColumn } from './Builder/Select'

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

//export type TableConfig = QueryableConfig & {
//  TODO?: string
//}

type SelectData = Record<string, any>
type InsertData = Record<string, any>
type UpdateData = Record<string, any>
type AnyData = InsertData
type RowData = QueryRow

export class Table extends Queryable {

  config: TableSpec
  table: string
  columns: TableColumns
  queries: NamedQueries<TableInstance>
  readonly: string[]
  required: string[]
  keys: string[]
  id: string
  recordClass: RecordConstructor
  recordConfig: RecordConfig
  relations: RelationsConfig
  // aliased methods
  // insertRow:     "insertOneRow",       // TODO
  // insertRows:    "insertAllRows",      // TODO
  // insertRecord:  "insertOneRecord",    // TODO
  // insertRecords: "insertAllRecords",   // TODO

  update!: (
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) => Promise<UpdateResult>


  constructor(
    database: DatabaseInstance,
    config: TableConfig
  ) {
    super(database.engine, config);
    this.config        = this.configure(config) || config;
    this.database      = database || fail("No database specified");
    this.table         = config.table;
    this.columns       = prepareColumns(config.table, config.columns);
    this.readonly      = Object.keys(this.columns).filter( key => this.columns[key].readonly );
    this.required      = Object.keys(this.columns).filter( key => this.columns[key].required );
    const { id, keys } = prepareKeys(config.table, config, this.columns);
    this.keys          = keys
    this.id            = id
    this.recordClass   = config.recordClass || RecordClass;
    this.recordConfig  = config.recordConfig;
    this.queries       = config.queries || { };
    this.fragments     = this.prepareFragments(config);
    this.relations     = config.relations || { };
    this.build         = databaseBuilder(this.database);
    aliasMethods(this, methodAliases);
    addDebugMethod(this, 'table', { debugPrefix: `Table:${this.table}` }, config);
  }

  configure(config: TableConfig) {
    return config;
  }

  prepareFragments(config: TableSpec) {
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
  async insert(
    data: InsertData | InsertData[], // TODO: generic
    options?: InsertOptions
  ) {
    return isArray(data)
      ? this.insertAll(data, options)
      : this.insertOne(data, options)
  }

  async prepareInsert(
    data: InsertData,
    options?: InsertOptions
  ) {
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

  async validateInsert(
    data: InsertData,
    options: InsertOptions = { }
  ) {
    return this.checkWritableColumns(data, options);
  }

  async insertOne(
    data: InsertData,
    options?: InsertOptions
  ) {
    const insert = await this
      .prepareInsert(data, options)
      .then(
        query => query.run(undefined, { keys: this.keys })
      )
    return this.inserted(data, insert, options);
  }

  async insertAll(
    data: InsertData[],
    options?: InsertOptions
  ) {
    this.debugData("insertAll()", { data, options });
    let rows = [ ];
    for (const row of data) {
      rows.push(await this.insertOne(row, options));
    }
    return rows;
  }

  async insertOneRow(
    data: InsertData,
    options?: InsertOptions
  ) {
    this.debugData("insertOneRow()", { data, options });
    return this.insertOne(data, this.withReloadOption(options))
  }

  async insertAllRows(
    data: InsertData[],
    options?: InsertOptions
  ) {
    this.debugData("insertAllRows()", { data, options });
    return this.insertAll(data, this.withReloadOption(options))
  }

  async insertOneRecord(
    data: InsertData,
    options?: InsertOptions
  ) {
    this.debugData("insertOneRecord()", { data, options });
    return this.insertOne(data, this.withRecordOption(options))
  }

  async insertAllRecords(
    data: InsertData[],
    options?: InsertOptions
  ) {
    this.debugData("insertAllRecords()", { data, options });
    return this.insertAll(data, this.withRecordOption(options))
  }

  async inserted(
    input: InsertData,
    output: InsertResult,
    options: InsertOptions = { }
  ) {
    return options.reload || options.record
      ? this.insertReload(input, output, options)
      : output;
  }

  async insertReload(
    input: InsertData,
    output: InsertResult,
    options: InsertOptions = { }
  ) {
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
  async prepareUpdate(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
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

  async validateUpdate(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
    const [ , , update] = this.checkUpdatableColumns(set, options);
    const [ , , criteria] = this.checkWhereColumns(where, options);
    return [update, criteria]
  }

  async updateOne(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
    this.debugData("updateOne()", { set, where, options });
    const update = await this
      .prepareUpdate(set, where, options)
      .then( query => query.run() );
    return update.changes === 1
      ? this.updated(set, where, update, options)
      : unexpectedRowCount(update.changes, 'updated');
  }

  async updateAny(
    set: UpdateData,
    where?: SelectData,
    options: UpdateOptions = { }
  ) {
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

  async updateAll(
    set: UpdateData,
    where?: SelectData,
    options: UpdateOptions = { }
  ): Promise<UpdateResult> {
    this.debugData("updateAllRows()", { set, where, options });
    const update = await this
      .prepareUpdate(set, where, options)
      .then( query => query.run() );
    return options.reload
      ? fail("Cannot reload multiple updated rows")
      : update as UpdateResult;
  }

  async updateOneRow(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
    this.debugData("updateOneRow()", { set, where, options });
    return this.updateOne(set, where, this.withReloadOption(options))
  }

  async updateAnyRow(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
    this.debugData("updateAnyRow()", { set, where, options });
    return this.updateAny(set, where, this.withReloadOption(options))
  }

  async updated(
    set: UpdateData,
    where: SelectData | undefined,
    result: UpdateResult,
    options: UpdateOptions = { }
  ) {
    return options.reload
      ? this.updateReload(set, where, options)
      : result;
  }

  async updateReload(
    set: UpdateData,
    where?: SelectData,
    options?: UpdateOptions
  ) {
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
  async delete(
    where?: SelectData,
    options?: DeleteOptions
  ) {
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

  async validateDelete(
    where: SelectData,
    options: DeleteOptions
  ) {
    const [ , , criteria] = this.checkWhereColumns(where, options);
    return criteria;
  }

  async deleted(
    _where: SelectData,
    result: DeleteResult,
    _options?: DeleteOptions
  ) {
    return result;
  }

  //-----------------------------------------------------------------------------
  // fetch - using where data
  //-----------------------------------------------------------------------------
  prepareFetch(
    where: SelectData,
    options: FetchOptions = { }
  ) {
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

  async fetchOne(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchOne()", { where, options });
    const row = await this.prepareFetch(where, options).one();
    return await this.loadedOne(row, options);
  }

  async fetchAny(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchAny()", { where, options });
    const row = await this.prepareFetch(where, options).any();
    return row
      ? await this.loadedOne(row, options)
      : undefined;
  }

  async fetchAll(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchAllRows()", { where, options });
    const rows = await this.prepareFetch(where, options).all();
    return await this.loadedAll(rows, options);
  }

  async fetchOneRecord(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchOneRecord()", { where, options });
    return this.fetchOne(where, this.withRecordOption(options));
  }

  async fetchAnyRecord(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchAnyRecord()", { where, options });
    return this.fetchAny(where, this.withRecordOption(options));
  }

  async fetchAllRecords(
    where: SelectData,
    options?: FetchOptions
  ) {
    this.debugData("fetchAllRecords()", { where, options });
    return this.fetchAll(where, this.withRecordOption(options));
  }

  //-----------------------------------------------------------------------------
  // Generic methods map onto equivalent fetch or select methods depending on
  // first arguments.  If it's a query (string or builder) then it's forwarded
  // to the select method, otherwise to the fetch method.
  //-----------------------------------------------------------------------------
  async oneRow(
    query?: SelectData | QuerySource,
    ...args: [QueryParams, QueryOptions?] | [FetchOptions?]
  ) {
    this.debugData("oneRow()", { query, args });
    return isQuery(query)
      ? this.one(query, ...args as [QueryParams, QueryOptions])
      : this.fetchOne(query, ...args as [FetchOptions])
  }

  async anyRow(
    query?: SelectData | QuerySource,
    ...args: [QueryParams?, FetchOptions?] | [FetchOptions?]
  ) {
    this.debugData("anyRow()", { query, ...args });
    return isQuery(query)
      ? this.any(query, ...args as [QueryParams, FetchOptions])
      : this.fetchAny(query, ...args as [FetchOptions])
  }

  async allRows(
    query?: SelectData | QuerySource,
    ...args: [QueryParams?, FetchOptions?] | [FetchOptions?]
  ) {
    this.debugData("allRows()", { query, ...args });
    return isQuery(query)
      ? this.all(query, ...args as [QueryParams, FetchOptions])
      : this.fetchAll(query, ...args as [FetchOptions])
  }

  async oneRecord(
    query?: SelectData | QuerySource,
    ...args: [QueryParams?, FetchOptions?] | [FetchOptions?]
  ) {
    this.debugData("oneRecord()", { query, args });
    return isQuery(query)
      ? this.one(query, args[0] as QueryParams, this.withRecordOption(args[1] as FetchOptions))
      : this.fetchOne(query, this.withRecordOption(args[0] as FetchOptions))
  }

  async anyRecord(
    query?: SelectData | QuerySource,
    ...args: [QueryParams?, FetchOptions?] | [FetchOptions?]
  ) {
    this.debugData("anyRecord()", { query, args });
    return isQuery(query)
      ? this.any(query, args[0] as QueryParams, this.withRecordOption(args[1] as FetchOptions))
      : this.fetchAny(query, this.withRecordOption(args[0] as FetchOptions))
  }

  async allRecords(
    query?: SelectData | QuerySource,
    ...args: [QueryParams?, FetchOptions?] | [FetchOptions?]
  ) {
    this.debugData("allRecords()", { query, args });
    return isQuery(query)
      ? this.all(query, args[0] as QueryParams, this.withRecordOption(args[1] as FetchOptions))
      : this.fetchAll(query, this.withRecordOption(args[0] as FetchOptions))
  }

  async loaded(
    row: QueryRow,
    options: FetchOptions = { }
  ) {
    return options.record
      ? this.record(row)
      : row;
  }

  async loadedOne(
    row: QueryRow,
    options?: FetchOptions
  ) {
    return this.loaded(row, options);
  }

  async loadedAny(
    row?: QueryRow,
    options?: FetchOptions
  ) {
    return row
      ? this.loaded(row, options)
      : undefined;
  }

  // @NOT-ts-expect-error: loadedAll is not defined as async in base class - WHY?
  async loadedAll(
    rows: QueryRow[],
    options?: FetchOptions
  ) {
    // Hmmm... why did I do this?
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
  checkColumnNames(names: string | string[]) {
    const table = this.table;
    splitList(names).forEach(
      column => this.columns[column as string]
          || throwColumnValidationError('unknown', { column, table })
    )
  }

  checkColumns(
    data: AnyData = { },
    options: CheckColumnsOptions = { },
    cols: string[] = [ ],
    vals: any[] = [ ]
  ): [string[], any[], CheckedColumnsData] {
    this.debugData("checkColumns()", { data, options})
    const table = this.table;
    let result: CheckedColumnsData = { };
    // check that all the values supplied correspond to valid columns
    Object.keys(data).forEach(
      column => {
        const spec = this.columns[column];
        if (spec) {
          if (options.writable && spec.readonly) {
            throwColumnValidationError('readonly', { column, table });
          }
          // TODO: this is a misnomer: options.fixed should really be
          // options.unfixed as it's asking us to assert that the column
          // is NOT fixed
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

  checkWritableColumns(
    data: InsertData,
    options: InsertOptions
  ) {
    return this.checkColumns(
      data,
      { ...options, writable: true }
    )
  }

  checkUpdatableColumns(
    data: UpdateData,
    options: UpdateOptions = { }
  ) {
    return this.checkColumns(
      data,
      { ...options, writable: true, fixed: true }
    )
  }

  checkWhereColumns(
    where: SelectData,
    options: CheckColumnsOptions
  ) {
    return this.checkColumns(where, options)
  }

  checkRequiredColumns(
    data: InsertData
  ) {
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
  select(...args: [column?: SelectColumn, ...moreColumns: SelectColumn[]]) {
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
  newRecord(row: QueryRow) {
    return recordProxy(
      new this.recordClass(this, row, this.recordConfig)
    );
  }

  record(row: QueryRow) {
    this.debugData("record()", { row });
    return Promise.resolve(
      this.newRecord(row)
    );
  }

  records(rows: QueryRow[]) {
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

  identity(data: Record<string, any>) {
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
