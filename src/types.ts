// Top-level configuration passed to the connect() method.
import Builder from './Builder'
import Database from './Database'
import Engine from './Engine'
import Query from './Query'
import Queryable from './Queryable'
import Transaction from './Transaction'

// TODO: add in tables, queries, etc.
export type ConnectConfig = {
  database?:      string | DatabaseConnectionConfig
  env?:           Record<string, string>
  envPrefix?:     string
  engineOptions?: Record<string, any>
  pool?:          PoolOptions
}

// Work in progress that should be merged into the above
export type DatabaseSpec = {
  tables: TablesSpec
}

// The loosely-defined object for specifying connection options.  It
// contains all the various parameters and aliases for connecting.
// Rather problematically, we also allow any engine-specific options to
// be specified in here.  I think that should be tightened down to require
// a specific options object.
export type DatabaseConnectionConfig = {
  engine?:        string
  database?:      string
  name?:          string
  user?:          string
  username?:      string
  password?:      string
  pass?:          string
  hostname?:      string
  host?:          string
  port?:          string | number
  options?:       EngineOptions
  // SQLite only
  filename?:      string
  file?:          string
  // Postgres only
  connectionString?: string
}

// The well-defined database connection options that are parsed from a
// database connection string, environment variables, or extracted from the
// DatabaseConnectionConfig.
export type DatabaseConnection = {
  engine:    string
  database?: string,
  user?:     string
  password?: string
  host?:     string
  port?:     string | number
  options?:  EngineOptions
  pool?:     PoolOptions
  // TODO: put pool options in here too?
  // SQLite only
  filename?: string
  // Postgres only
  connectionString?: string
  // TODO: add options in here?  Otherwise we have to all any additional options
};

export type PoolOptions = {
  min?: number
  max?: number
  acquireTimeoutMillis?: number
  createTimeoutMillis?: number
  destroyTimeoutMillis?: number
  idleTimeoutMillis?: number
  reapIntervalMillis?: number
  createRetryIntervalMillis?: number
  propagateCreateError?: boolean
}
export type EngineOptions = Record<string, any>

export type TableSpec = {
  table?: string
  columns: TableColumnsSpec
  queries?: NamedQueries
  fragments?: QueryFragments
  relations?: RelationSpec[]
  id?: string
  keys?: string | string[]
}

export type TablesSpec = Record<string, TableSpec>
export type NamedQueries = Record<string, string>
export type QueryFragments = Record<string, string>

export type TableColumnSpec = Partial<TableColumn> | string
export type TableColumnsSpec = Record<string, TableColumnSpec> | string | string[]

export type TableColumn = {
  id?:         boolean
  key?:        boolean
  readonly?:   boolean
  fixed?:      boolean
  required?:   boolean
  type?:       string
  column:      string
  tableColumn: string
}

export type TableColumns = Record<string, TableColumn>

// export type TableColumnBitKey = keyof TableColumnSpec
export type TableColumnFragmentKey = 'id' | 'readonly' | 'required' | 'fixed' | 'key'
export type TableColumnFragmentValuableKey = 'type' | 'column'
export type TableColumnFragmentKeyValue = `${TableColumnFragmentValuableKey}=${string}`

export type TableColumnFragment = TableColumnFragmentKey | TableColumnFragmentKeyValue
export type TableColumnFragments = TableColumnFragment[]

export type RelationType = 'any' | 'one' | 'many' | 'map'
export type RelationArrow = '~>' | '->' | '=>' | '#>'
export type RelationArrowMap = Record<RelationArrow, RelationType>
export type RelationKey = 'table' | 'type' | 'from' | 'to' | 'where' | 'order' | 'key' | 'value' | 'relation'
export type RelationAlias = 'localKey' | 'local_key' | 'remoteKey' | 'remote_key' | 'orderBy' | 'order_by'
export type RelationAliases = Record<RelationAlias, RelationKey>

// tmp hacks
export type RelationWhere = Record<string, any>
export type RelationRecord = { row: Record<string, any> }

export type RelationSpec = {
  name?:  string
  table:  string
  type:   RelationType
  from:   string
  to:     string
  where?: RelationWhere
  order?: string
  key?:   string
  value?: string
  relation?: string
  load?: any        // fixme
}

export type RelationConfig = Partial<
  RelationSpec & Record<RelationAlias, string>
>

export type QueryArgs = [] | [QueryParams] | [QueryOptions] | [QueryParams, QueryOptions]
export type QueryParams = any[]
// TODO: lock this down
export type QueryOptions = Record<string, any>
export type QueryRow = Record<string, any>

export type SanitizeResultOptions = {
  keys?: string[]
}

export type ExecuteOptions = SanitizeResultOptions & {
  transact?: { connection: any },
  sanitizeResult?: boolean
}

export type DatabaseInstance = InstanceType<typeof Database>
export type EngineInstance = InstanceType<typeof Engine>
export type BuilderInstance = InstanceType<typeof Builder>
export type TransactionInstance = InstanceType<typeof Transaction>
export type QueryableInstance = InstanceType<typeof Queryable>
export type QueryInstance = InstanceType<typeof Query>
export type Stringable = string | number | boolean
