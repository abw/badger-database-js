import { addDebug } from "@abw/badger";
import { fail, isArray } from "@abw/badger-utils";
import recordProxy from "./Proxy/Record.js";
import rowProxy from "./Proxy/Row.js";
import rowsProxy from "./Proxy/Rows.js";
import Record from "./Record.js";
import Schema from "./Schema.js";
// import Queries from "./Queries.js";

// export class Table extends Queries {
export class Table {
  constructor(database, schema) {
    this.database      = database || fail("No database specified");
    this.schema        = new Schema(database, schema)
    this.recordClass   = schema.recordClass || Record;
    this.recordOptions = schema.recordOptions;
    this.rowProxy      = rowProxy(this);
    this.rowsProxy     = rowsProxy(this);
    addDebug(this, schema.debug, schema.debugPrefix || `<${this.table}> table: `, schema.debugColor);
  }
  knex() {
    return this.database.knex(this.schema.table);
  }
  raw() {
    return this.database.raw(...arguments);
  }
  query(name) {
    return this.raw(this.schema.query(name));
  }
  insert(data) {
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
  update(set, where) {
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
