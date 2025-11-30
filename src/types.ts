export type TableColumnSpec = Partial<TableColumn> | string
export type TableColumnsSpec = Record<string, TableColumnSpec> | string | string[]

export type TableColumn = {
  id?:         boolean
  readonly?:   boolean
  required?:   boolean
  type?:       string
  column:      string
  tableColumn: string
}

export type TableColumns = Record<string, TableColumn>

// export type TableColumnBitKey = keyof TableColumnSpec
export type TableColumnFragmentKey = 'id' | 'readonly' | 'required'
export type TableColumnFragmentValuableKey = 'type' | 'column'
export type TableColumnFragmentKeyValue = `${TableColumnFragmentValuableKey}=${string}`

export type TableColumnFragment = TableColumnFragmentKey | TableColumnFragmentKeyValue
export type TableColumnFragments = TableColumnFragment[]

export type RelationType = 'any' | 'one' | 'many' | 'map'
export type RelationArrow = '~>' | '->' | '=>' | '#>'
export type RelationArrowMap = Record<RelationArrow, RelationType>
export type RelationKey = 'table' | 'type' | 'from' | 'to' | 'where' | 'order' | 'key' | 'value' | 'relation'
export type RelationAliases = Record<string, RelationKey>

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
