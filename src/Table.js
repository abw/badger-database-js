import { addDebug } from "@abw/badger";
import { fail, isArray } from "@abw/badger-utils";
import recordProxy from "./Proxy/Record.js";
import rowProxy from "./Proxy/Row.js";
import rowIdProxy from "./Proxy/RowId.js";
import rowsProxy from "./Proxy/Rows.js";
import Record from "./Record.js";
import Schema from "./Schema.js";
// import Queries from "./Queries.js";

// export class Table extends Queries {
export class Table {
  constructor(database, schema) {
    this.database    = database || fail("No database specified");
    this.schema      = new Schema(database, schema)
    this.recordClass = schema.record || Record;
    this.rowProxy    = rowProxy(this);
    this.rowsProxy   = rowsProxy(this);
    this.rowIdProxy   = rowIdProxy(this);

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
    return this.insertRow4(row);
  }
  insertRow1(row) {
    // this works fine to return a row but fails when appending .record()
    // 'users.insertRow(...).record is not a function',
    return this.query().insert(row).then(
      ([id]) => this.query().select().first().where({ [this.schema.id]: id })
    )
  }
  insertRow2(row) {
    // this is the same
    return this.query().insert(row).then(
      ([id]) => this.fetchOne({ [this.schema.id]: id })
    )
  }
  insertRow3(row) {
    // this fails on simple insert:
    // Method Promise.prototype.then called on incompatible receiver #<Promise>',
    // but works with .record() appended
    return this.rowProxy(
      this.query().insert(row).then(
        ([id]) => this.query().select().first().where({ [this.schema.id]: id })
      )
    )
  }
  insertRow4(row) {
    // this is the same
    return this.rowProxy(
      this.query().insert(row).then(
        ([id]) => this.fetchOne({ [this.schema.id]: id })
      )
    )
  }
  async insertRow5(row) {
    // this works for basic insert but fails on .record()
    // users.insertRow(...).record is not a function'
    return this.rowProxy(
      await this.query().insert(row).then(
        ([id]) => this.query().select().first().where({ [this.schema.id]: id })
        // ([id]) => this.fetchOne({ [this.schema.id]: id })
      )
    )
  }
  insertRow6(row) {
    // this fails on basic insert:
    // Method Promise.prototype.then called on incompatible receiver #<Promise>
    // but works with .record()
    return this.rowProxy(
      this.query().insert(row).then(
        ([id]) => this.fetchOne({ [this.schema.id]: id })
      )
    )
  }
  async insertRow7(row) {
    // this works with basic insert but fails on .record()
    // 'users.insertRow(...).record is not a function',
    const [id] = await this.query().insert(row);
    console.log('inserted: ', id);
    return this.fetchOne({ [this.schema.id]: id });
    //return this.rowProxy(
    //  this.query().select().first().where({ [this.schema.id]: id })
    //);
  }
  async insertRow8(row) {
    return await this.query().insert(row).then(
      ([id]) => this.fetchOne({ [this.schema.id]: id })
    )
  }
  insertRow9(row) {
    return this.rowIdProxy(
      this.query().insert(row)
    )
  }
  insertRows(rows) {
    return this.rowsProxy(
      Promise.all(
        rows.map(
          row => this.query().insert(row).then(
            ([id]) => this.query().select().first().where({ [this.schema.id]: id })
          )
        )
      )
    );
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
    return query.then(
      rows => rows.map( row => recordProxy(new this.recordClass(this, row)) )
    );
  }
}

export const table = (database, schema) => new Table(database, schema)

export default Table;
