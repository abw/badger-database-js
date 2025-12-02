import { isArray, isObject, isString, joinList, joinListAnd, noValue, objMap, splitList } from '@abw/badger-utils'
import { bitSplitter, defaultIdColumn } from '../Constants'
import { throwColumnValidationError } from './Error.js'
import { TableColumn, TableColumnFragments, TableColumns, TableColumnSpec, TableColumnsSpec, TableSpec } from '../types'
import { areValidColumnFragments, invalidColumnFragments, invalidTableColumnObjectKeys, isValidTableColumnObject } from './Types'

/**
 * Function to convert an array of column specification fragments into a
 * well-structured `TableColumn` object.
 * @example
 * ```ts
 * const column = prepareColumnSpecFragments(
 *   'artists', 'id',
 *   ['readonly', 'type=number'],
 * })
 * ```
 * Returns:
 * ```ts
 * {
 *   column: 'id',
 *   tableColumn: 'artists.id',
 *   readonly: true,
 *   type: 'number'
 * }
 * ```
 **/
export const prepareColumnFragments = (
  table: string,
  column: string,
  fragments: TableColumnFragments,
): TableColumn => {
  return fragments.reduce(
    (result, fragment) => {
      const kv = fragment.split('=', 2);
      const key = kv.shift();
      result[key] = kv.length ? kv[0] : true;
      return result
    },
    { column, tableColumn: `${table}.${column}` }
  )
}

/**
 * Splits a string containing colon-separated column specification fragments
 * into an array, validating that they are all valid `TableColumnFragment`
 * strings.  Returns a `TableColumnFragments` array or throws an error.
 * @example
 * ```ts
 * const fragments = splitColumnSpecFragments(
 *   'artists', 'id',
 *   'readonly:type=number'
 * )
 * ```
 * Returns:
 * ```ts
 * [ 'readonly', 'type=number']
 * ```
 **/

export const splitColumnFragments = (
  table: string,
  column: string,
  spec: string
): TableColumnFragments => {
  const fragments = spec.split(bitSplitter)
  if (areValidColumnFragments(fragments)) {
    return fragments
  }
  else {
    throwInvalidColumnFragments(table, column, spec, fragments)
  }
}

export const throwInvalidColumnFragments = (
  table: string,
  column: string,
  spec: string,
  fragments: string[]
) => {
  const invalid = invalidColumnFragments(fragments)
  const istr = joinListAnd( invalid.map( i => `'${i}'` ) )
  const reason = `${istr} ${invalid.length > 1 ? 'are' : 'is'} not valid`
  throwColumnValidationError(
    'invalidColumnSpec',
    { table, column, spec, reason }
  )
}

/**
 * Prepares a column specification, validating it for correctness as either
 * a string containing one or more `TableColumnFragment` parts separated by
 * colons, or a `TableSpec` object (a `Partial<TableColumn>`) containing valid
 * keys that can be upgraded to a `TableColumn` object.  Throws an error if
 * the `spec` is invalid.
 * @example
 * Specifying a string of column fragments
 * ```ts
 * const column = prepareColumn(
 *   'artists', 'id',
 *   'readonly:type=number'
 * )
 * ```
 * Returns:
 * ```ts
 * {
 *    column: 'id',
 *    tableColumn: 'artists.id',
 *    readonly: true,
 *    type: 'number'
 * }
 * ```
 * @example
 * Specifying an object containing a partial `TableColumn` specification
 * ```ts
 * const column = prepareColumn(
 *   'artists', 'id',
 *   { readonly: true, type: 'number' }
 * )
 * ```
 * Returns:
 * ```ts
 * {
 *    column: 'id',
 *    tableColumn: 'artists.id',
 *    readonly: true,
 *    type: 'number'
 * }
 * ```
 **/

export const prepareColumn = (
  table: string,
  column: string,
  spec: TableColumnSpec
): TableColumn => {
  if (isString(spec)) {
    return prepareColumnFragments(
      table,
      column,
      splitColumnFragments(table, column, spec)
    )
  }
  else if (isValidTableColumnObject(spec)) {
    // column name can be defined in column spec as 'column' in case
    // the database column name doesn't match the name you want to use
    // const o = value as TableColumnSpec
    column = (spec.column ||= column)
    // tableColumn is the full "table.column"
    spec.tableColumn = `${table}.${column}`
    return spec;
  }
  else if (isObject(spec)) {
    const invalid = invalidTableColumnObjectKeys(spec)
    const istr = joinListAnd( invalid.map( i => `'${i}'` ) )
    const reason = invalid.length > 1
      ? `${istr} are not valid keys`
      : `${istr} is not a valid key`
    throwColumnValidationError(
      'invalidColumn',
      { table, column, reason }
    )
    //(`Invalid column specification for ${table}.${column} (${ikeys})`)
  }
  else if (noValue(spec)) {
    // Note that TS allows null and undefined to be assignable to anything.
    // If a column has no value then we assume it's an empty object with all
    // defaults.
    return { column, tableColumn: `${table}.${column}`}
  }
  else {
    throwColumnValidationError(
      'invalidColumnSpec',
      { table, column, spec, reason: `${typeof spec} is not a valid type` }
    )
  }
}

/**
 * Function to prepare column definitions for a table.  If the columns specified
 * are a string of whitespace delimited tokens then they are first split into an
 * array.  An array is converted to a hash object by splitting each item on the
 * first colon, e.g. `id:required` has the column name `id` and flags of `required`.
 * Each value is then converted to an object, e.g. `required` becomes `{ required: true }`.
 * Then end result is an object where the keys are the column names and corresponding
 * values are objects containing any flags defined for the column.
 * @example
 * Specifying `columns` as a string of column names
 * ```ts
 * const columns = prepareColumns(
 *   'artists',
 *   'id name'
 * )
 * ```
 * @example
 * Specifying `columns` as a string of column names and modifiers
 * ```ts
 * const columns = prepareColumns(
 *   'artists',
 *   'id:readonly name:required'
 * )
 * ```
 * @example
 * Specifying `columns` as an array of names with optional modifiers
 * ```ts
 * const columns = prepareColumns(
 *   'artists',
 *   ['id:readonly', 'name:required']
 * )
 * ```
 * @example
 * Specifying `columns` as an object with string as values
 * ```ts
 * const columns = prepareColumns({
 *   table: 'artists',
 *   columns: {
 *     id:   'readonly',
 *     name: 'required'
 *   }
 * })
 * ```
 * @example
 * Specifying `columns` as an object with objects as values
 * ```ts
 * const columns = prepareColumns({
 *   table: 'artists',
 *   columns: {
 *     id:   { readonly: true },
 *     name: { required: true }
 *   }
 * })
 * ```
 */
export const prepareColumns = (
  table: string,
  columns: TableColumnsSpec
) => {
  if (noValue(columns)) {
    throwColumnValidationError('noColumns', { table })
  }

  if (isString(columns)) {
    return prepareColumnsString(table, columns);
  }
  else if (isArray(columns)) {
    return prepareColumnsArray(table, columns);
  }
  else if (isObject(columns)) {
    return prepareColumnsObject(table, columns);
  }
  else {
    return throwColumnValidationError('invalidColumns', { table, columns });
  }
}

/**
 * Function to prepare column definitions for a table, where the `columns` are
 * specified as a whitespace delimited string of column names with optional
 * modifiers.
 * @example
 * Specifying `columns` as a string of column names
 * ```ts
 * const columns = prepareColumns(
 *   'artists',
 *   'id name'
 * )
 * ```
 * @example
 * Specifying `columns` as a string of column names and modifiers
 * ```ts
 * const columns = prepareColumns(
 *   'artists',
 *   'id:readonly name:required'
 * )
 * ```
 **/
export const prepareColumnsString = (
  table: string,
  columns: string
) => prepareColumnsArray(
  table,
  splitList(columns) as string[]
)

/**
 * Function to prepare column definitions for a table, where the `columns` are
 * specified as an array of strings containing column names with optional
 * modifiers.
 * @example
 * ```ts
 * const columns = prepareColumnsArray(
 *   'artists',
 *   ['id', 'name:required:type=string']
 * )
 * ```
 **/

export const prepareColumnsArray = (
  table: string,
  columns: string[]
) => {
  return columns.reduce(
    (columns, spec) => {
      const fragments = spec.split(bitSplitter)
      const column = fragments.shift()
      if (areValidColumnFragments(fragments)) {
        columns[column] = prepareColumnFragments(table, column, fragments);
      }
      else {
        throwInvalidColumnFragments(table, column, spec, fragments)
      }
      return columns
    },
    { } as TableColumns
  )
}

/**
 * Function to prepare column definitions for a table, where the `columns` are
 * specified as an object with keys for column names and values containing
 * any valid column specification
 * modifiers.
 * @example
 * ```ts
 * const columns = prepareColumnsObject(
 *   'artists',
 *   {
 *     id: 'readonly:type=number',
 *     name: { required: true, type: 'string' }
 *   }
 * )
 * ```
 **/

export const prepareColumnsObject = (
  table: string,
  columns: TableColumnsSpec
) => {
  return Object.entries(columns).reduce(
    (columns, [column, spec]) => ({
      ...columns,
      [column]: prepareColumn(table, column, spec)
    }),
    { } as TableColumns
  )
}

/**
 * Function to determine the id and/or keys columns for a table.
 * If an `id` column is explicitly listed in the schema then it is assumed
 * to be the single id column which is both the (single entry) array of keys
 * and the id.  Otherwise we look for all the columns (hopefully no more than
 * one) that have the `id` flag set.  If there is more than one then an error
 * is thrown.  Failing that it looks for either an explicit list of keys in
 * the table specification (either a whitespace delimited string of column
 * names or array of column name strings), or all the columns that have the
 * `key` flag set.  If none of those cases hold then the default `id` key is
 * assumed.
 * @example
 * Specifying an explicit `id` column in the schema
 * ```ts
 * const { id, keys } = prepareKeys(
 *   'artists',
 *   {
 *     id: 'artist_id', // explicit id column
 *   },
 *   {
 *     artist_id: { type: 'number', required: true, readonly: true },
 *     name:      { type: 'string', required: true },
 *   },
 * )
 * ```
 * @example
 * Specifying an explicit array of `keys` column in the schema
 * ```ts
 * const { id, keys } = prepareKeys(
 *   'artists',
 *   {
 *     keys: ['label_id', 'artist_id'], // explicit keys array
 *   },
 *   {
 *     label_id:  { type: 'number', required: true },
 *     artist_id: { type: 'number', required: true, readonly: true },
 *     name:      { type: 'string', required: true },
 *   },
 * )
 * ```
 * @example
 * Specifying a column with the `id` flag set
 * ```ts
 * const { id, keys } = prepareKeys(
 *   'artists',
 *   { ... },
 *   {
 *     artist_id: { type: 'number', required: true, readonly: true, id: true },
 *     name:      { type: 'string', required: true },
 *   }
 * )
 * @example
 * Specifying the `key` flag on one or more columns
 * ```ts
 * const { id, keys } = prepareKeys(
 *   'artists',
 *   { ... },
 *   {
 *     label_id:  { type: 'number', required: true, key: true },
 *     artist_id: { type: 'number', required: true, readonly: true, key: true },
 *     name:      { type: 'string', required: true },
 *   },
 * )
 * ```
 */
export const prepareKeys = (
  table: string,
  spec: TableSpec,
  columns: TableColumns
) => {
  // Look for an explicit id column defined in the spec
  if (spec.id) {
    return {
      keys: [spec.id],
      id: spec.id
    }
  }

  // Look for all the columns that have the id flag set...
  const ids = Object.keys(columns).filter(
    key => columns[key].id
  )
  // ...if there are any then, like Connor MacLeod, there should be only one
  if (ids.length > 1) {
    return throwColumnValidationError(
      'multipleIds', {
        table,
        ids: joinListAnd( ids.map(i => `"${i}"` ) )
      }
    )
  }
  else if (ids.length) {
    return {
      keys: ids,
      id: ids[0]
    }
  }

  // Look for an explicit keys definition in the schema - this can be a
  // whitespace delimited string or array of strings.  Otherwise find all
  // columns that have the key flag set
  const keys = spec.keys
    ? splitList(spec.keys) as string[]
    : Object.keys(columns).filter( key => columns[key].key )

  if (keys.length) {
    return { keys }
  }

  // No keys or id defined so we assume an 'id' column
  return {
    id: defaultIdColumn,
    keys: [defaultIdColumn]
  }
}
