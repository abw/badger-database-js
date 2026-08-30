import { TableSpec, TablesSpec } from '../types'
import { prepareColumns, prepareKeys, throwColumnValidationError } from '../Utils'
import { TableColumnSpecs, TableActionsColumnSpecs, TablesActionsColumnSpecs } from './types'

export const prepareTablesActionsColumnSpecs = (
  tables: TablesSpec
): TablesActionsColumnSpecs =>
  Object.entries(tables).reduce(
    (tableTypes, [table, spec]) => {
      tableTypes[table] = prepareTableActionsColumnSpecs(table, spec)
      return tableTypes
    },
    { } as TablesActionsColumnSpecs
  )

export const prepareTableColumnSpecs = (
  table: string,
  spec: TableSpec
): TableColumnSpecs => {
  const columns = prepareColumns(table, spec.columns)

  return Object.entries(columns).reduce(
    (columns, [name, column]) => {
      const { required=false, type='string' } = column
      columns.push({ name, type, optional: ! required })
      return columns
    },
    [ ] as TableColumnSpecs
  )
}


export const prepareTableActionsColumnSpecs = (
  table: string,
  spec: TableSpec
): TableActionsColumnSpecs => {
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
      [ ] as TableColumnSpecs
    )

    const updateColumns = Object.entries(columns).reduce(
      (columns, [name, column]) => {
        const { readonly=false, fixed=false, type='string' } = column
        if (! readonly && ! fixed) {
          columns.push({ name, type, optional: true })
        }
        return columns
      },
      [ ] as TableColumnSpecs
    )

    const selectColumns = Object.entries(columns).reduce(
      (columns, [name, column]) => {
        const { type='string' } = column
        columns.push({ name, type, optional: true })
        return columns
      },
      [ ] as TableColumnSpecs
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
      [ ] as TableColumnSpecs
    )

  return {
    insert: insertColumns,
    update: updateColumns,
    select: selectColumns,
    delete: deleteColumns,
  }
}
