import { capitalise, fail } from '@abw/badger-utils'
import { DatabaseSpec, TableColumn, TableSpec } from '../types'
import { prepareColumns, prepareKeys } from './Columns'
import Table from '../Table'
import { throwColumnValidationError } from './Error'

type TableActions = 'select' | 'insert' | 'update' | 'delete'
type TableActionTypes = Record<TableActions, string>
type TableActionTypeNames = Record<TableActions, string>

export type TableColumnTypeSpec = {
  name:     string
  optional: boolean
  type:     string
}

export type TableTypeSpecs = Record<TableActions, TableColumnTypeSpec[]>
export type TablesTypeSpecs = Record<string, TableTypeSpecs>
export type TableTypes = {
  table: string,
  typeNames: TableActionTypeNames
  actions: TableActionTypes
  tableTypeName: string
  tableType: string
}
export type TablesTypes = Record<string, TableTypes>
export type OutputTypesConfig = {
  database?: string
  databaseTypeName?: string
}

export const generateTypes = (database: DatabaseSpec) => {
  const tables = database.tables
  const tableTypes = Object.entries(tables).reduce(
    (tableTypes, [table, spec]) => {
      tableTypes[table] = generateTableTypes(
        table,
        prepareTableTypes(table, spec)
      )
      // console.log(`${table}: `, tableTypes[table]);
      return tableTypes
    },
    { } as TablesTypes
  )
  // console.log('table types: ', tableTypes)
  // fail('generateTypes() is TODO')
  return tableTypes
}

export const generateTableTypes = (
  table: string,
  types: TableTypeSpecs
): TableTypes => {
  const capName = capitalise(table)
  const typeNames = generateTableTypeNames(capName)
  const actions = Object.entries(types).reduce(
    (tableTypes, [action, spec]) => {
      tableTypes[action] = tableActionType(typeNames[action], spec)
      return tableTypes
    },
    { } as TableActionTypes
  )
  const tableTypeName = `${capName}Table`
  return {
    table,
    typeNames,
    actions,
    tableTypeName,
    tableType: tableType(tableTypeName, typeNames)
  }
}

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

export const generateTableTypeNames = (
  tableTypePrefix: string,
): TableActionTypeNames => {
  return {
    insert: `${tableTypePrefix}TableInsertColumns`,
    update: `${tableTypePrefix}TableUpdateColumns`,
    select: `${tableTypePrefix}TableSelectColumns`,
    delete: `${tableTypePrefix}TableDeleteColumns`,
  }
}

const tableActionType = (
  name: string,
  types: TableColumnTypeSpec[]
) => {
  // console.log(`tableType ${name}: `, types)
  return [
    `export type ${name} = {`,
    ...types.map(
      spec => `  ${spec.name}${spec.optional ? '?' : ''}: ${spec.type}`
    ),
    `}`
  ].join('\n')
}

const tableType = (
  name: string,
  actionTypes: TableActionTypeNames
) => {
  // console.log(`tableType ${name}: `, actionTypes)
  const actions = Object.entries(actionTypes).map(
    ([action, type]) => `  ${action}: ${type}`
  )

  return [
    `export type ${name} = {`,
    ...actions,
    `}`
  ].join('\n')
}

export const outputTypes = (
  tablesTypes: TablesTypes,
  options?: OutputTypesConfig
) => {
  return [
    outputTablesTypes(tablesTypes),
    outputDatabaseType(tablesTypes, options)
  ].join('\n')
}

export const outputTablesTypes = (
  tablesTypes: TablesTypes
) => {
  return Object.values(tablesTypes).map(
    tableType => outputTableTypes(tableType)
  ).join('\n')
}

export const outputTableTypes = (
  tableTypes: TableTypes
) => {
  return [
    '//---------------------------------------------------------------------------',
    `// ${tableTypes.table}`,
    '//---------------------------------------------------------------------------',
    ...Object.values(tableTypes.actions),
    tableTypes.tableType,
    ''
  ].join('\n')
}

export const outputDatabaseType = (
  tablesTypes: TablesTypes,
  options: OutputTypesConfig = { databaseTypeName: 'MyDatabase' }
) => {
  const { databaseTypeName } = options
  return [
    '//---------------------------------------------------------------------------',
    `// database`,
    '//---------------------------------------------------------------------------',
    `export interface ${databaseTypeName} {`,
    `  tables: {`,
    ...Object.values(tablesTypes).map(
      tableType => `    ${tableType.table}: ${tableType.tableTypeName}`,
    ),
    '  }',
    '}'
  ].join('\n')
}

/*
*/

/*
const tableTypes(name: string) {
  tableType(name: string, types: DatabaseColumnTypeSpec[]) {
    return [
      `export type ${name} = {`,
      ...types.map(
        spec => `  ${spec.name}${spec.optional ? '?' : ''}: ${spec.type}`
      ),
      `}`
    ].join('\n')
  }
*/

/*
  async prepareTableColumnTypes(name: string) {
    const config = await this.loadTableConfig(name)
    const columns: DatabaseTableColumns = prepareColumns(config)
    const keys: string[] = prepareKeys(config, columns)

    const updateColumns = Object.entries(columns).reduce(
      (columns: DatabaseColumnTypeSpec[], [name, column]) => {
        const { readonly=false, fixed=false, type='string' } = column
        if (! readonly && ! fixed) {
          columns.push({ name, type, optional: true })
        }
        return columns
      },
      [ ]
    )

    const deleteColumns = keys.reduce(
      (cols: DatabaseColumnTypeSpec[], name: string) => {
        const column = columns[name]
        const { type='string' } = column
        cols.push({ name, type, optional: false })
        return cols
      },
      [ ]
    )

    return { selectColumns, insertColumns, updateColumns, deleteColumns }
  }
  async tableTypes(name: string) {
    const specs = await this.prepareTableColumnTypes(name)
    const capName = capitalise(name)
    return [
      this.tableType(`${capName}TableSelectColumns`, specs.selectColumns),
      this.tableType(`${capName}TableInsertColumns`, specs.insertColumns),
      this.tableType(`${capName}TableUpdateColumns`, specs.updateColumns),
      this.tableType(`${capName}TableDeleteColumns`, specs.deleteColumns),
    ].join('\n\n')
  }
  tableType(name: string, types: DatabaseColumnTypeSpec[]) {
    return [
      `export type ${name} = {`,
      ...types.map(
        spec => `  ${spec.name}${spec.optional ? '?' : ''}: ${spec.type}`
      ),
      `}`
    ].join('\n')
  }
}


export default Tables
*/