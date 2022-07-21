import { doNothing, fail, hasValue, isString, splitList } from "@abw/badger";
import { splitHash } from "./Utils.js";

export class Schema {
  constructor(spec) {
    const columns = splitList(spec.columns);
    this.table = spec.table;
    this.columnNames = columns;
    this.virtualColumns = spec.virtualColumns || { };
    this.tableColumns = prepareColumns(columns, this.table);
    this.columnSets = prepareColumnSets(columns, spec.columnSets);
    // addDebug(this, spec.debug, spec.debugPrefix || 'Schema', spec.debugColor);
    this.debug = spec.debug
      ? console.log.bind(console)
      : doNothing;
  }
  column(name) {
    return this.tableColumns[name]
      || (this.virtualColumns[name] && [this.virtualColumns[name], name])
      || fail('Invalid column specified: ', name);
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
}

export const prepareColumns = (columns, table) => {
  let set = { };
  columns.map(
    column => set[column] = `${table}.${column}`
  );
  return set;
}

export const prepareColumnSets = (columns, columnSets) => {
  let sets = { };
  Object.entries(columnSets).map(
    ([key, value]) => sets[key] = prepareColumnSet(columns, value)
  );
  return sets;
}

export const prepareColumnSet = (columns, columnSet) => {
  const basis   = isString(columnSet) ? splitList(columnSet) : columns;
  const include = splitList(columnSet.include);
  const exclude = splitHash(columnSet.exclude);
  return [...basis, ...include]
    .filter( column => ! exclude[column] );
}

export const schema = spec => new Schema(spec);

export default Schema
