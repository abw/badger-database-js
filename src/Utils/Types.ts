import { isObject } from '@abw/badger-utils'
import { MATCH_VALID_FRAGMENT_KEY, VALID_TABLE_COLUMN_KEYS } from '../Constants'
import { TableColumn, TableColumnFragment, TableColumnFragments } from '../types'

export const isObjKey = <T extends object>(
  key: PropertyKey,
  obj: T
): key is keyof T =>
  key in obj

export const isValidTableColumnKey = (key: PropertyKey) =>
  isObjKey(key, VALID_TABLE_COLUMN_KEYS)

export const isValidTableColumnObject = (o: any): o is TableColumn =>
  isObject(o) && Object.keys(o).every(isValidTableColumnKey)

export const invalidTableColumnObjectKeys = (o: object) =>
  Object.keys(o).filter( k => ! isValidTableColumnKey(k) )

export const isValidColumnFragment = (fragment: string): fragment is TableColumnFragment =>
  Boolean(fragment.match(MATCH_VALID_FRAGMENT_KEY))

export const areValidColumnFragments = (fragments: string[]): fragments is TableColumnFragments =>
  fragments.every(isValidColumnFragment)

export const invalidColumnFragments = (fragments: string[]) =>
  fragments.filter( f => ! isValidColumnFragment(f) )




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
