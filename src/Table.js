import recordProxy from "./Proxy/Record.js";
import rowProxy from "./Proxy/Row.js";
import rowsProxy from "./Proxy/Rows.js";
import Record from "./Record.js";
import Queries from "./Queries.js";
// import Schema from "./Schema.js";
import { fail, isArray, noValue, splitList } from "@abw/badger-utils";
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
  checkColumns(data, cols=[], vals=[], test={}) {
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
  // Basic queries
  //-----------------------------------------------------------------------------
  async insert(data) {
    if (isArray(data)) {
      return this.insertAll(data);
    }
    this.debug("insert: ", data);
    const [cols, vals] = this.checkWritableColumns(data);
    this.checkRequiredColumns(data);
    return this.engine.insert(this.table, cols, vals, this.keys);
    // const result = await this.engine.insert(this.table, cols, vals, this.keys);
    // ([id]) => this.knex().select().first().where({ [this.schema.id]: id })
  }
  async insertAll(data) {
    this.debug("insertAll: ", data);
    return data.map(
      async row => await this.insert(row)
    );
  }
  async update(data, where) {
    this.debug("update: ", data, where);
    const [dcols, dvals] = this.checkWritableColumns(data);
    const [wcols, wvals] = this.checkColumns(where);
    return this.engine.update(this.table, dcols, dvals, wcols, wvals);
  }
  async delete(where) {
    this.debug("delete: ", where);
    const [cols, vals] = this.checkColumns(where);
    return this.engine.delete(this.table, cols, vals);
  }
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
  OLDinsert(data) {
    return isArray(data)
      ? this.insertRows(data)
      : this.insertRow(data);
  }
  insertRow(row) {
    return this.rowProxy(
      this.knex().insert(row).then(
        ([id]) => this.knex().select().first().where({ [this.schema.id]: id })
      )
    )
  }
  insertRows(rows) {
    return this.rowsProxy(
      this.insertRowsAsync(rows)
    )
    /*
    // I *think* this should work... but it's beyond my ability/patience to
    // figure out why it doesn't :-(
    /*
    return this.rowsProxy(
      Promise.all(
        rows.map(
          data => this.knex().insert(data)
            .then(
              ([id]) => this.knex().select().first().where({ [this.schema.id]: id })
            )
        )
      )
    )
    */
  }
  async insertRowsAsync(rows) {
    let results = [ ];
    for (const row of rows) {
      const result = await this.knex().insert(row)
        .then(
          ([id]) => this.knex().select().first().where({ [this.schema.id]: id })
        )
      results.push(result)
    }
    return results;
  }
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
