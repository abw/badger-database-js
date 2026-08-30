import { snakeToStudlyPreserveCase } from '@/Utils/Case'
import { DatabaseSpec, TableSpec, TablesSpec } from '../types'
import { prepareTableActionsColumnSpecs, prepareTableColumnSpecs } from './Prepare'
import {
  ActionTypeNameGenerator, DatabaseTypes, TableActionsColumnSpecs,
  TableActionTypes, TableColumnSpecs, TablesTypes, TableTypeNames, TableTypes, TypeGenOptions,
  TypeNameGenerator
} from './types'

export const defaultDatabaseTypeNameGenerator: TypeNameGenerator = name =>
  `${snakeToStudlyPreserveCase(name)}Database`

export const defaultTableTypeNameGenerator: TypeNameGenerator = name =>
  `${snakeToStudlyPreserveCase(name)}Table`

export const defaultTableActionTypeNameGenerator: ActionTypeNameGenerator = (
  prefix: string,
  action: string
) =>
  `${prefix}${snakeToStudlyPreserveCase(action)}Columns`

//--------------------------------------------------------------------------
// Database
//--------------------------------------------------------------------------
export const generateDatabaseTypes = (
  database: DatabaseSpec,
  options: TypeGenOptions = { }
): DatabaseTypes => {
  return {
    databaseTypeName: generateDatabaseTypeName(database.name, options),
    tablesTypes: generateTablesTypes(database.tables)
  }
}

export const generateDatabaseTypeName = (
  database: string,
  options: TypeGenOptions = { }
): string => {
  const {
    databaseTypeNameGenerator = defaultDatabaseTypeNameGenerator,
  } = options
  return databaseTypeNameGenerator(database)
}

//--------------------------------------------------------------------------
// Tables
//--------------------------------------------------------------------------
export const generateTablesTypes = (
  tables: TablesSpec,
  options?: TypeGenOptions
): TablesTypes => {
  return Object.entries(tables).reduce(
    (tts, [name, spec]) => {
      tts[name] = generateTableTypes(name, spec, options)
      return tts
    },
    { }
  )
}

export const generateTableTypes = (
  tableName: string,
  tableSpec: TableSpec,
  options: TypeGenOptions = { }
): TableTypes => {
  const typeNames = generateTableTypeNames(tableName, options)
  const tableType = generateTableType(typeNames)
  const rowType   = generateTableActionType(
    typeNames.row,
    prepareTableColumnSpecs(tableName, tableSpec)
  )
  const actionTypes = generateTableActionsTypes(
    typeNames,
    prepareTableActionsColumnSpecs(tableName, tableSpec)
  )
  return {
    table: tableName,
    tableType,
    rowType,
    typeNames,
    actionTypes
  }
}

export const generateTableTypeNames = (
  table: string,
  options: TypeGenOptions = { }
): TableTypeNames => {
  const {
    tableTypeNameGenerator = defaultTableTypeNameGenerator,
    tableActionTypeNameGenerator = defaultTableActionTypeNameGenerator
  } = options
  const tableType = tableTypeNameGenerator(table)
  return {
    table:  tableType,
    row:    tableActionTypeNameGenerator(tableType, 'row'),
    actions: {
      insert: tableActionTypeNameGenerator(tableType, 'insert'),
      update: tableActionTypeNameGenerator(tableType, 'update'),
      select: tableActionTypeNameGenerator(tableType, 'select'),
      delete: tableActionTypeNameGenerator(tableType, 'delete'),
    }
  }
}

//--------------------------------------------------------------------------
// Actions
//--------------------------------------------------------------------------
export const generateTableActionsTypes = (
  typeNames: TableTypeNames,
  actions: TableActionsColumnSpecs,
): TableActionTypes => {
  const actionNames = typeNames.actions
  return Object.entries(actions).reduce(
    (types, [action, spec]) => {
      types[action] = generateTableActionType(actionNames[action], spec)
      return types
    },
    { } as TableActionTypes
  )
}

export const generateTableActionType = (
  name: string,
  types: TableColumnSpecs
) => [
  `export type ${name} = {`,
    ...types.map(
      spec => `  ${spec.name}${spec.optional ? '?' : ''}: ${spec.type}`
    ),
  `}`
].join('\n')

export const generateTableType = (
  typeNames: TableTypeNames
) => {
  // console.log(`tableType ${name}: `, actionTypes)
  const actions = Object.entries(typeNames.actions).map(
    ([action, type]) => `  ${action}: ${type}`
  )
  const row = `  row:    ${typeNames.row}`

  return [
    `export type ${typeNames.table} = {`,
    ...actions,
    row,
    `}`
  ].join('\n')
}
