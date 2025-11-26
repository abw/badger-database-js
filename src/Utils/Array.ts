import { isArray } from '@abw/badger-utils'

export const toArray = <T>(item: T | T[]) =>
  isArray(item)
    ? item
    : [item]