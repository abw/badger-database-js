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
