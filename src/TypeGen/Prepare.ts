import { DatabaseSpec, TableSpec } from '../types'
import { prepareColumns, prepareKeys, throwColumnValidationError } from '../Utils'
import { TableColumnTypeSpec, TablesTypeSpecs, TableTypeSpecs } from './types'

export const prepareTablesTypes = (
  database: DatabaseSpec
): TablesTypeSpecs =>
  Object.entries(database.tables).reduce(
    (tableTypes, [table, spec]) => {
      tableTypes[table] = prepareTableTypes(table, spec)
      return tableTypes
    },
    { } as TablesTypeSpecs
  )

export const prepareTableTypes = (
  table: string,
  spec: TableSpec
): TableTypeSpecs => {
  const columns = prepareColumns(table, spec.columns)
  const { keys } = prepareKeys(table, spec, columns)

  const insertColumns = Object.entries(columns).reduce(
      (columns, [name, column]) => {
        const { readonly=false, required=false, type='string' } = column
        if (! readonly) {
          columns.push({ name, type, optional: ! required })
        }
        return columns
      },
      [ ] as TableColumnTypeSpec[]
    )

    const updateColumns = Object.entries(columns).reduce(
      (columns, [name, column]) => {
        const { readonly=false, fixed=false, type='string' } = column
        if (! readonly && ! fixed) {
          columns.push({ name, type, optional: true })
        }
        return columns
      },
      [ ] as TableColumnTypeSpec[]
    )

    const selectColumns = Object.entries(columns).reduce(
      (columns, [name, column]) => {
        const { type='string' } = column
        columns.push({ name, type, optional: true })
        return columns
      },
      [ ] as TableColumnTypeSpec[]
    )

    const deleteColumns = keys.reduce(
      (deleteColumns, name: string) => {
        const column = columns[name]
          || throwColumnValidationError(
            'invalidKey', { table, key: name }
          )
        const { type='string' } = column
        deleteColumns.push({ name, type, optional: false })
        return deleteColumns
      },
      [ ] as TableColumnTypeSpec[]
    )

  return {
    insert: insertColumns,
    update: updateColumns,
    select: selectColumns,
    delete: deleteColumns,
  }
}
