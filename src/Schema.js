import Queries from "./Queries.js";
import { hasValue, isString, splitList, splitHash, fail, objMap, isArray } from "@abw/badger-utils";
import { addDebug } from "@abw/badger";

const DEFAULT_ID = 'id';
const COLUMN_SET_PREFIX = /^(@|\.\.\.)/;

export class Schema {
  constructor(database, schema) {
    this.database       = database || fail("No database specified");
    this.table          = schema.table || fail("No table name specified");
    this.relations      = schema.relations || { };
    this.prepareColumns(schema);
    this.prepareKeys(schema);
    this.prepareColumnSets(schema);
    this.prepareFragments(schema);
    this.queries = new Queries({
      queries:   schema.queries,
      fragments: this.fragments
    });
    // TODO: column sets for select, update, etc.

    addDebug(this, schema.debug, schema.debugPrefix || 'Schema', schema.debugColor);
    this.debug('columnIndex: ', this.columnIndex);
    this.debug('fragments: ', this.fragments);
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
        value.tableColumn = table + '.' + column;
        return value;
      }
    )
    this.columnNames    = Object.keys(this.columnIndex);
    this.virtualColumns = schema.virtualColumns || { };
    this.allColumns     = {
      // ...splitHash(this.columnNames),
      // ...splitHash(Object.keys(this.virtualColumns))
      ...this.columnIndex,
      ...this.virtualColumns
    };
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
        return result;
      }
    )
  }
  prepareKeys(schema) {
    this.keys = splitList(schema.keys);
    if (schema.id) {
      this.id = schema.id;
      this.keys.unshift(this.id);
    }
    else if (this.keys.length === 0) {
      this.id = DEFAULT_ID;
      this.keys.unshift(this.id);
    }
    this.keyIndex = splitHash(this.keys);
  }
  prepareFragments(schema) {
    const quote     = this.database.quote.bind(this.database);
    const fragments = schema.fragments || { };
    const vcolumns  = Object.entries(this.virtualColumns).reduce(
      (result, [name, defn]) => {
        result[name] = `${defn} as ${name}`;
        return result;
      },
      { }
    );
    this.fragments = {
      table:    quote(this.table),
      columns:  this.columnNames.map(quote).join(', '),
      tcolumns: this.columnNames.map( n => quote(this.columnIndex[n].tableColumn) ).join(', '),
      ...vcolumns,
      ...fragments
    };
  }
  query(name) {
    return this.queries.query(name);
  }

  // TODO: refactor remaining methods
  column(name) {
    return this.columnIndex[name]
      ? this.columnIndex[name].tableColumn
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
}

export const schema = (database, schema) =>
  new Schema(database, schema);

export default Schema
