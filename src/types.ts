// Top-level configuration passed to the connect() method.
import Builder from './Builder'
import Database from './Database'
import Engine from './Engine'
import Query from './Query'
import Queryable, { QueryableConfig } from './Queryable'
import RecordClass from './Record'
import Table from './Table'
import Tables from './Tables'
import Transaction from './Transaction'
import { DebugConfig } from './Utils'

// TODO: add in tables, queries, etc.
export type ConnectConfig = QueryableConfig & {
  database?:      string | DatabaseConnectionConfig
  env?:           Record<string, string>
  envPrefix?:     string
  engineOptions?: Record<string, any>
  pool?:          PoolOptions
  tables?:        TablesConfig
  tablesClass?:   TablesConstructor
  tablesObject?:  TablesInstance
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
export type EngineConfig = DebugConfig & DatabaseConnection
export type EngineOptions = Record<string, any>

export type TablesConstructor = new (config: TablesConfig) => TablesInstance
// Loosely defined tables configuration
export type TablesConfig = Record<string, any>       // TODO

// More rigidly defined specification after pre-processing
export type TablesSpec = Record<string, TableSpec>

export type TableSpec = DebugConfig & {
  table?: string
  columns: TableColumnsConfig
  queries?: NamedQueries
  fragments?: QueryFragments
  relations?: RelationsConfig
  id?: string
  keys?: string | string[]
  recordClass?: RecordConstructor
  recordConfig?: RecordConfig
}

export type TableColumnsConfig = Record<string, TableColumnConfig> | string | string[]
export type TableColumnConfig = Partial<TableColumn> | string
export type TableColumns = Record<string, TableColumn>
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


export type TableColumnFragmentKey = 'id' | 'readonly' | 'required' | 'fixed' | 'key'
export type TableColumnFragmentValuableKey = 'type' | 'column'
export type TableColumnFragmentKeyValue = `${TableColumnFragmentValuableKey}=${string}`
export type TableColumnFragment = TableColumnFragmentKey | TableColumnFragmentKeyValue
export type TableColumnFragments = TableColumnFragment[]

export type FetchOptions = {
  columns?: boolean
  orderBy?: string
  order?: string
  record?: boolean
  pick?: boolean
}
export type InsertOptions = {
  reload?: boolean
  record?: boolean
  pick?: boolean
}
export type UpdateOptions = {
  reload?: boolean
  record?: boolean
  pick?: boolean
}
export type DeleteOptions = {
  // reload?: boolean
  // record?: boolean
  pick?: boolean
}
export type CheckColumnsOptions = FetchOptions & InsertOptions & UpdateOptions & {
  writable?: true
  fixed?: true
}

export type CheckedColumnsData = Record<string, any>
// TODO
export type InsertResult = Record<string, any>
export type UpdateResult = Record<string, any>
export type DeleteResult = Record<string, any>

export type RecordConstructor = new (table: TableInstance, row: QueryRow, config: RecordConfig, ) => RecordInstance
export type RecordConfig = {
}

export type NamedQueries = Record<string, string>
export type QueryFragments = Record<string, string>

export type RelationsConfig = Record<string, RelationConfig>
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

export type QueryableInstance = InstanceType<typeof Queryable>
export type DatabaseInstance = InstanceType<typeof Database>
export type EngineInstance = InstanceType<typeof Engine>
export type BuilderInstance = InstanceType<typeof Builder>
export type QueryInstance = InstanceType<typeof Query>
export type TablesInstance = InstanceType<typeof Tables>
export type TableInstance = InstanceType<typeof Table>
export type RecordInstance = InstanceType<typeof RecordClass>
export type TransactionInstance = InstanceType<typeof Transaction>
export type Stringable = string | number | boolean
