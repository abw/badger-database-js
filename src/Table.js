import { addDebug } from "@abw/badger";
import { fail } from "@abw/badger-utils";
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
    this.recordClass = schema.record || Record;
    this.rowProxy    = rowProxy(this);
    this.rowsProxy   = rowsProxy(this);

    addDebug(this, schema.debug, schema.debugPrefix || `${this.table} table`, schema.debugColor);
  }
  query() {
    return this.database.query(this.schema.table);
  }
  insert(data) {
    return this.query().insert(data);
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

  //fetch(query);
  //  this.query().insert();
  /*
  all(...args) {
    return this.select().where(...args);
  }
  any(...args) {
    return this.all(...args).first();
  }
  one(...args) {
    return this.all(...args).then(
      rows => {
        if (rows.length === 1) {
          return rows[0];
        }
        else {
          throw new Error(`Query for one ${this.schema.table} returned ${rows.length} records`);
        }
      }
    );
  }
  */
}

export const table = (database, schema) => new Table(database, schema)

export default Table;
