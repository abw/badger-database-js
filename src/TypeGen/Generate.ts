import { snakeToStudly } from '@abw/badger-utils'
import { ActionTypeNameGenerator, TableTypeNames, TypeGenOptions, TypeNameGenerator } from './types'

export const defaultDatabaseTypeNameGenerator: TypeNameGenerator = name =>
  `${snakeToStudly(name)}Database`

export const defaultTableTypeNameGenerator: TypeNameGenerator = name =>
  `${snakeToStudly(name)}Table`

export const defaultTableActionTypeNameGenerator: ActionTypeNameGenerator = (
  prefix: string,
  action: string
) =>
  `${prefix}${snakeToStudly(action)}Columns`

export const generateDatabaseTypeNames = (
  database: string,
  options: TypeGenOptions = { }
): string => {
  const {
    databaseTypeNameGenerator = defaultDatabaseTypeNameGenerator,
  } = options
  return databaseTypeNameGenerator(database)
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
    insert: tableActionTypeNameGenerator(tableType, 'insert'),
    update: tableActionTypeNameGenerator(tableType, 'update'),
    select: tableActionTypeNameGenerator(tableType, 'select'),
    delete: tableActionTypeNameGenerator(tableType, 'delete'),
  }
}

/*
export const generateTableTypeName = (
  name: string,
  generator: TypeNameGenerator = defaultTableTypeNameGenerator
) => generator(name)

export const generateTableActionColumnsTypeName = (
  prefix: string,
  action: string,
  generator: ActionTypeNameGenerator = defaultTableActionColumnsTypeNameGenerator
) => generator(prefix, action)
*/

