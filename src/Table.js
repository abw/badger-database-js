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
    this.database    = database || fail("No database specified");
    this.schema      = new Schema(database, schema)
    this.recordClass = schema.recordClass || Record;
    this.rowProxy    = rowProxy(this);
    this.rowsProxy   = rowsProxy(this);

    addDebug(this, schema.debug, schema.debugPrefix || `${this.table} table`, schema.debugColor);
  }
  query() {
    return this.database.query(this.schema.table);
  }
  insert(data) {
    return isArray(data)
      ? this.insertRows(data)
      : this.insertRow(data);
  }
  insertRow(row) {
    return this.rowProxy(
      this.query().insert(row).then(
        ([id]) => this.query().select().first().where({ [this.schema.id]: id })
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
          data => this.query().insert(data)
            .then(
              ([id]) => this.query().select().first().where({ [this.schema.id]: id })
            )
        )
      )
    )
    */
  }
  async insertRowsAsync(rows) {
    let results = [ ];
    for (const row of rows) {
      const result = await this.query().insert(row)
        .then(
          ([id]) => this.query().select().first().where({ [this.schema.id]: id })
        )
      results.push(result)
    }
    return results;
  }
  selectAll(columns) {
    return this.rowsProxy(
      this.query().select(
        this.schema.columns(columns)
      )
    );
  }
  selectOne(columns) {
    return this.rowProxy(
      this.query().select(
        this.schema.columns(columns)
      )
    ).first();
  }
  fetchAll(where) {
    const select = this.query().select();
    return this.rowsProxy(
      where
        ? select.where(where)
        : select
    );
  }
  fetchOne(where) {
    const select = this.query().select().first();
    return this.rowProxy(
      where
        ? select.where(where)
        : select
    );
  }
  record(query) {
    return query.then(
      row => recordProxy(new this.recordClass(this, row))
    );
  }
  records(query) {
    // console.log('table.records()');
    return query.then(
      rows => rows.map( row => recordProxy(new this.recordClass(this, row)) )
    );
  }
}

export const table = (database, schema) => new Table(database, schema)

export default Table;
