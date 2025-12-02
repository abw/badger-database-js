export type DatabaseSpec = {
  tables: TablesSpec
}

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
