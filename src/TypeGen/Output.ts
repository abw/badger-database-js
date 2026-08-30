import { DatabaseTypes, OutputTypesConfig, TablesTypes, TableTypes } from './types'

export const WARNING = [
  '//==========================================================================',
  '// WARNING:',
  '//   These types are generated automatically from the database schema.',
  '//   Any changes you make here may be lost.',
  '//==========================================================================',
  ''
].join("\n")

export const outputDatabaseTypes = (
  types: DatabaseTypes,
  options: OutputTypesConfig = { }
) => {
  const { warning = WARNING } = options
  return [
    warning,
    outputTablesTypes(types.tablesTypes),
    outputDatabaseType(types, options)
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
    `// Table: ${tableTypes.table}`,
    '//---------------------------------------------------------------------------',
    ...Object.values(tableTypes.actionTypes),
    tableTypes.rowType,
    tableTypes.tableType,
    ''
  ].join('\n')
}

export const outputDatabaseType = (
  types: DatabaseTypes,
  options: OutputTypesConfig = { }
) => {
  return [
    '//---------------------------------------------------------------------------',
    `// Database`,
    '//---------------------------------------------------------------------------',
    `export interface ${types.databaseTypeName} {`,
    `  tables: {`,
    ...Object.values(types.tablesTypes).map(
      tableType => `    ${tableType.table}: ${tableType.typeNames.table}`,
    ),
    '  }',
    '}'
  ].join('\n')
}
