import { fail, isArray, isObject, isString, objMap, splitList } from "@abw/badger-utils";
import { bitSplitter, defaultIdColumn } from "../Constants.js";
import { throwColumnValidationError } from "./Error.js";


/**
 * Function to prepare column definitions for a table.  If the columns specified
 * are a string of whitespace delimited tokens then they are first split into an
 * array.  An array is converted to a hash object by splitting each item on the
 * first colon, e.g. `id:required` has the column name `id` and flags of `required`.
 * Each value is then converted to an object, e.g. `required` becomes `{ required: true }`.
 * Then end result is an object where the keys are the column names and corresponding
 * values are objects containing any flags defined for the column.
 * @param {!Object} schema - scheme containing table properties
 * @param {!String} [schema.table] - the database table name
 * @param {String|Array|Object} [schema.columns] - the table columns
 * @return {Object} a column specification object
 * @example
 * const columns = prepareColumns({
 *   table:   'artists',
 *   columns: 'id name'
 * })
 * @example
 * const columns = prepareColumns({
 *   table:   'artists',
 *   columns: 'id:readonly name:required'
 * })
 * @example
 * const columns = prepareColumns({
 *   table: 'artists',
 *   columns: ['id:readonly', 'name:required']
 * })
 * @example
 * const columns = prepareColumns({
 *   table: 'artists',
 *   columns: {
 *     id:   'readonly',
 *     name: 'required'
 *   }
 * })
 * @example
 * const columns = prepareColumns({
 *   table: 'artists',
 *   columns: {
 *     id:   { readonly: true },
 *     name: { required: true }
 *   }
 * })
 */
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
  return prepareColumnsArray(splitList(columns), schema);
}

const prepareColumnsArray = (columns, schema) => {
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

/**
 * @ignore
 * Internal function to convert an array of colon delimited parts from a column
 * specification string to an object.
 */
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


/**
 * Function to determine the id and/or keys columns for a table.
 * If the keys are explicitly listed in the schema then they are used.
 * Otherwise it looks for each column that defines the `key` flag.
 * If the `id` column is set in the schema, or as an `id` flag on a
 * column then that is assumed to be both the id and single key.
 * If no keys or id is defined then we assume it's an `id` column.
 * @param {!Object} schema - scheme containing table properties
 * @param {!String} [schema.table] - the database table name
 * @param {Object} columns - the table columns
 * @return {Array} - an array of keys
 */
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
