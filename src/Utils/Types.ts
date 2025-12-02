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


