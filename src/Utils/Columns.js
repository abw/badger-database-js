import { fail, isArray, isObject, isString, objMap, splitList } from "@abw/badger-utils";
import { bitSplitter, defaultIdColumn } from "../Constants.js";
import { throwColumnValidationError } from "./Error.js";

export const prepareColumns = (schema) => {
  const columns = schema.columns
    || throwColumnValidationError('noColumns', { table: schema.table });

  if (isString(columns)) {
    return prepareColumnsString(columns, schema);
  }
  else if (isArray(columns)) {
    return prepareColumnsArray(columns, schema);
  }
  else if (isObject(columns)) {
    return prepareColumnsHash(columns, schema);
  }
  else {
    return throwColumnValidationError('invalidColumns', { table: schema.table, columns });
  }
}

const prepareColumnsString = (columns, schema) => {
  // columns can be a string of whitespace delimited values, which
  // is equivalent to passing an array of strings
  return prepareColumnsArray(splitList(columns), schema);
}

const prepareColumnsArray = (columns, schema) => {
  // columns can be an array of strings, each of which should be a
  // name, optionally followed by a series of flags or key=value
  // items, separated by colons, e.g. 'name:required', 'name:type=text',
  // 'name:required:type=text'
  let index = { };
  columns.forEach(
    item => {
      const bits  = item.split(bitSplitter);
      const name  = bits.shift();
      index[name] = prepareColumnBits(name, bits, schema);
    }
  )
  return prepareColumnsHash(index, schema);
}

const prepareColumnsHash = (columns, schema) => {
  return objMap(
    columns,
    (value, name) => {
      if (isString(value)) {
        return prepareColumnBits(name, value.split(bitSplitter), schema)
      }
      else if (isObject(value)) {
        // column name can be defined in column spec as 'column' in case
        // the database column name doesn't match the name you want to use
        const column = value.column || (value.column = name);
        // tableColumn is the full "table.column"
        value.tableColumn = schema.table + '.' + column;
        return value;
      }
      else {
        fail(`Invalid "${name}" columns specified in ${schema.table} table: ${value}`)
      }
    }
  )
}

const prepareColumnBits = (name, bits, schema) => {
  return bits.reduce(
    (result, bit) => {
      const kv = bit.split('=', 2);
      const key = kv.shift();
      result[key] = kv.length ? kv[0] : true;
      return result
    },
    { column: name, tableColumn: schema.table + '.' + name }
  );
}

export const prepareKeys = (schema, columns={}) => {
  let keys  = splitList(schema.keys);
  const ids = Object.keys(columns).filter( key => columns[key].id );
  if (ids.length > 1) {
    return throwColumnValidationError('multipleIds', { table: schema.table });
  }
  if (keys.length === 0) {
    keys = Object.keys(columns).filter( key => columns[key].key );
  }
  if (schema.id) {
    keys.unshift(schema.id);
  }
  else if (ids.length) {
    schema.id = ids[0];
    keys.unshift(schema.id);
  }
  else if (keys.length === 0) {
    schema.id = defaultIdColumn;
    keys.unshift(schema.id);
  }
  return keys;
}
