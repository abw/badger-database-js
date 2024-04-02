import { isArray } from '@abw/badger-utils';

export const toArray = item =>
  isArray(item)
    ? item
    : [item]