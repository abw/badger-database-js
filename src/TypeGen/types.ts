export type TableActions = 'select' | 'insert' | 'update' | 'delete'
export type TableActionTypes = Record<TableActions, string>
export type TableTypeExtras = 'table'
export type TableTypeNames = Record<TableActions | TableTypeExtras, string>
// export type TableActionTypeNames = Record<TableActions | 'table', string>

export type TableColumnTypeSpec = {
  name:     string
  optional: boolean
  type:     string
}

export type TableTypeSpecs = Record<TableActions, TableColumnTypeSpec[]>
export type TablesTypeSpecs = Record<string, TableTypeSpecs>
export type TableTypes = {
  table: string,
  typeNames: TableTypeNames
  actions: TableActionTypes
  tableTypeName: string
  tableType: string
}
export type TablesTypes = Record<string, TableTypes>
export type OutputTypesConfig = {
  database?: string
  databaseTypeName?: string
}

export type TypeNameGenerator = (name: string) => string
export type ActionTypeNameGenerator = (prefix: string, action: string) => string

export type TypeGenOptions = {
  databaseTypeNameGenerator?: TypeNameGenerator,
  tableTypeNameGenerator?: TypeNameGenerator,
  tableActionTypeNameGenerator?: ActionTypeNameGenerator
}

