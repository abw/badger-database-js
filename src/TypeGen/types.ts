/*
 * Generated types for a database specification
 */
export type DatabaseTypes = {
  databaseTypeName: string,
  tablesTypes: TablesTypes
}

/*
 * Record mapping a table name to the {@link TableTypes} generated for that table.
 */
export type TablesTypes = Record<string, TableTypes>

/**
 * Generated types for a particular table.
 */
export type TableTypes = {
  table: string,
  tableType: string
  rowType: string
  typeNames: TableTypeNames
  actionTypes: TableActionTypes
}

/**
 * Generated names for different parts of a table type.
 */
export type TableTypeNames = {
  table: string,
  row:   string,
  actions: TableActionTypeNames
}

/**
 * The basic actions on a table.
 */
export type TableActions = 'select' | 'insert' | 'update' | 'delete'

/**
 * Record mapping {@link TableActions} (e.g. `select`, `insert`, etc.) to the
 * name of the type generated for that action, e.g. `AlbumsTableInsertColumns`
 */
export type TableActionTypeNames = Record<TableActions, string>

/**
 * Record mapping {@link TableActions} (e.g. `select`, `insert`, etc.) to the
 * full generated type for the parameters passed to the method implementing
 * that action.
 */
export type TableActionTypes = Record<TableActions, string>

/**
 * Specification of a column used to generate a type for a table.
 */
export type TableColumnSpec = {
  name:     string
  optional: boolean
  type:     string
}

/**
 * Array of {@link TableColumnSpec} column specifications used to generate
 * a type for a table.
 */
export type TableColumnSpecs = TableColumnSpec[]

/**
 * Record mapping {@link TableActions} names to {@link TableColumnSpecs} arrays
 * containing specifications for all columns.
 */
export type TableActionsColumnSpecs = Record<TableActions, TableColumnSpecs>

/**
 * Record mapping table names to the {@link TableActionsColumnSpecs} mappings
 * for the actions on that table.
 */
export type TablesActionsColumnSpecs = Record<string, TableActionsColumnSpecs>

/**
 * Type for a utility function to generate a type name.
 */
export type TypeNameGenerator = (name: string) => string

/**
 * Type for a utility function to generate a type name for an action on a table.
 */
export type ActionTypeNameGenerator = (prefix: string, action: string) => string

/**
 * Options that can be passed to various type generating functions.
 */
export type TypeGenOptions = {
  databaseTypeNameGenerator?: TypeNameGenerator,
  tableTypeNameGenerator?: TypeNameGenerator,
  tableActionTypeNameGenerator?: ActionTypeNameGenerator
}


export type OutputTypesConfig = {
  warning?: string
}


