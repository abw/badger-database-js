import { hasValue, isString, splitList, fail } from "@abw/badger-utils";
import { prepareColumns, prepareColumnSets, splitHash } from "./Utils.js";
import { addDebug } from "@abw/badger";

const DEFAULT_ID = 'id';
const COLUMN_SET_PREFIX = /^(@|\.\.\.)/;

export class Schema {
  constructor(database, schema) {
    this.database       = database || fail("No database specified");
    this.table          = schema.table || fail("No table name specified");
    this.columnNames    = splitList(schema.columns);
    this.keys           = splitList(schema.keys);
    this.virtualColumns = schema.virtualColumns || { };
    this.tableColumns   = prepareColumns(this.columnNames, this.table);
    this.columnSets     = prepareColumnSets(this.columnNames, schema.columnSets);
    this.allColumns     = { ...splitHash(this.columnNames), ...splitHash(Object.keys(this.virtualColumns)) };

    //console.log('columnNames: ', this.columnNames);
    //console.log('virtualColumns: ', this.virtualColumns);
    //console.log('allColumns: ', this.allColumns);

    if (schema.id) {
      this.id = schema.id;
      this.keys.unshift(schema.id);
    }
    else if (this.keys.length === 0) {
      this.id = DEFAULT_ID;
      this.keys.unshift(this.id);
    }

    addDebug(this, schema.debug, schema.debugPrefix || 'Schema', schema.debugColor);
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
          if (name.match(COLUMN_SET_PREFIX)) {
            this.debug("%s is a columnSet %s", name, name.replace(COLUMN_SET_PREFIX, ''));
            cols.push(
              ...this.columnSet(name.replace(COLUMN_SET_PREFIX, ''))
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
}

export const schema = (database, schema) =>
  new Schema(database, schema);

export default Schema
