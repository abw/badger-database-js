import { hasValue, isString, splitList, fail, objMap, isArray } from "@abw/badger-utils";
import { splitHash } from "./Utils.js";
import { addDebug } from "@abw/badger";

const DEFAULT_ID = 'id';
const COLUMN_SET_PREFIX = /^(@|\.\.\.)/;

export class Schema {
  constructor(database, schema) {
    this.database       = database || fail("No database specified");
    this.table          = schema.table || fail("No table name specified");

    this.prepareColumns(schema);
    this.prepareKeys(schema);
    this.prepareColumnSets(schema);

    this.virtualColumns = schema.virtualColumns || { };
    //this.tableColumns   = prepareColumns(this.columnNames, this.table);
    //this.columnSets     = prepareColumnSets(this.columnNames, schema.columnSets);
    this.allColumns     = { ...splitHash(this.columnNames), ...splitHash(Object.keys(this.virtualColumns)) };

    //console.log('columnNames: ', this.columnNames);
    //console.log('virtualColumns: ', this.virtualColumns);
    //console.log('allColumns: ', this.allColumns);
    /// this.allKeys = splitHash(this.keys);

    // TODO: column sets for select, update, etc.

    addDebug(this, schema.debug, schema.debugPrefix || 'Schema', schema.debugColor);
  }
  prepareColumns(schema) {
    const table      = schema.table;
    const columns    = schema.columns;
    const index      = splitHash(columns, () => ({ }))
    this.columnIndex = objMap(
      index,
      (value, key) => {
        // column name can be defined in column spec as 'column' in case
        // the database column name doesn't match the name you want to use
        const column = value.column || (value.column = key);
        // tableColumn is the full "table.column"
        value.tableColumn = `${table}.${column}`;
        return value;
      }
    )
    this.columnNames  = Object.keys(this.columnIndex);
    this.tableColumns = objMap(
      this.columnIndex,
      value => value.tableColumn
    );
  }
  prepareColumnSets(schema) {
    const index = splitHash(schema.columnSets, () => ({ }))
    this.columnSets = objMap(
      index,
      (spec) => {
        const basis   = (isString(spec) || isArray(spec)) ? splitList(spec) : this.columnNames;
        const include = splitList(spec.include);
        const exclude = splitHash(spec.exclude);
        const result = [...basis, ...include]
          .filter( column => ! exclude[column] );
        // console.log('spec: ', spec, ' => ', result);
        // console.log('basis: ', basis, '   exclude: ', exclude);
        return result;
      }
    )
    //console.log('mapped columnSets: ', this.columnSets);
  }
  prepareKeys(schema) {
    this.keys = splitList(schema.keys);
    if (schema.id) {
      this.id = schema.id;
      this.keys.unshift(this.id);
    }
    else if (this.keys.length === 0) {
      this.id = DEFAULT_ID;
      // console.log('setting default id: ', this.id);
      this.keys.unshift(this.id);
    }
    this.keyIndex = splitHash(this.keys);
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
  identity(data) {
    return this.keys.reduce(
      (result, key) => {
        result[key] = data[key]
        return result
      },
      {}
    );
  }
  separateKeyColumns(data) {
    let keys    = { };
    let columns = { };
    let rejects = { };
    Object.entries(data).forEach(
      ([key, value]) => {
        if (this.allKeys[key]) {
          keys[key] = value;
        }
        else if (this.allColumns[key]) {
          columns[key] = value;
        }
        else {
          rejects[key] = value;
        }
      }
    )
    return { keys, columns, rejects };
  }
}

export const schema = (database, schema) =>
  new Schema(database, schema);

export default Schema
