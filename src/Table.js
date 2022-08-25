import { addDebug } from "@abw/badger";
import { fail, hasValue, isObject, isString, splitList } from "@abw/badger-utils";
import { prepareColumns, prepareColumnSets } from "./Utils.js";
// import Queries from "./Queries.js";

const DEFAULT_ID = 'id';

// export class Table extends Queries {
export class Table {
  constructor(database, schema) {
    this.database = database     || fail("No database specified");
    this.table    = schema.table || fail("No table name specified");
    this.keys     = splitList(schema.keys);
    this.fields   = splitList(schema.keys);
    if (schema.id) {
      this.id = schema.id;
      this.keys.unshift(schema.id);
    }
    else if (this.keys.length === 0) {
      this.id = DEFAULT_ID;
      this.keys.unshift(this.id);
    }
    const columns       = splitList(schema.columns);
    this.columnNames    = columns;
    this.virtualColumns = schema.virtualColumns || { };
    this.tableColumns   = prepareColumns(columns, this.table);
    this.columnSets     = prepareColumnSets(columns, schema.columnSets);

    addDebug(this, schema.debug, schema.debugPrefix || `${this.table} table`, schema.debugColor);
  }
  column(name) {
    return this.tableColumns[name]
      ? this.tableColumns[name]
      : this.virtualColumns[name]
        ? this.database.raw(`${this.virtualColumns[name]} as ${name}`)
        : fail('Invalid column specified: ', name);
  }
  columnSet(name) {
    return this.columnSets[name]
      || fail('Invalid columnSet specified: ', name);
  }
  defaultColumns() {
    return this.columnSets.default
      || this.columns;
  }
  columns(names) {
    return hasValue(names)
      ? this.resolveColumns(names)
      : this.defaultColumns().map( name => this.column(name) );
  }
  resolveColumns(names) {
    const list = splitList(names);
    let cols = [ ];
    list.forEach(
      name => {
        this.debug("resolveColumns(%s) / %s", names, name);
        if (isString(name)) {
          if (name.match(/^@/)) {
            this.debug("%s is a columnSet %s", name, name.replace(/^@/, ''));
            cols.push(
              ...this.columnSet(name.replace(/^@/, ''))
                .map( name => this.column(name) )
            );
          }
          else {
            this.debug("%s is a column", name);
            cols.push(this.column(name));
          }
        }
        else {
          fail("resolveColumns() can only currently resolve strings");
        }
      }
    )
    this.debug("resolveColumns(%s) => ", names, cols)
    return cols;
  }
  query() {
    return this.database.query(this.table);
  }
  insert(data) {
    return this.query().insert(data);
  }
  fetch() {
    const first = this.query().first();
    return arguments.length
      ? first.where(...arguments)
      : first;
  }
  fetchAll() {
    const select = this.query().select();
    return arguments.length
      ? select.where(...arguments)
      : select;
  }
  fetchOne() {
    return this.fetchAll(...arguments).then(
      rows => rows.length === 1
        ? rows[0]
        : fail(`fetchOne for ${this.table} returned ${rows.length} records`)
    )
  }
  selectArgs(...args) {
    // console.log('selectArgs: ', args);
    if (args.length === 1 && isObject(args[0])) {
      return args[0];
    }
    else if (isString(args[0])) {
      return {
        columns: args[0],
        where:   args[1]
      }
    }
  }
  select() {
    const args = this.selectArgs(...arguments);
    const select = this.query().select(this.columns(args.columns)).first();
    return args.where
      ? select.where(args.where)
      : select;
  }
  selectAll() {
    const args = this.selectArgs(...arguments);
    const select = this.query().select(this.columns(args.columns));
    return args.where
      ? select.where(args.where)
      : select;
  }
  selectOne() {
    return this.selectAll(...arguments).then(
      rows => rows.length === 1
        ? rows[0]
        : fail(`selectOne for ${this.table} returned ${rows.length} records`)
    )
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
