import { isArray, isUndefined } from '@abw/badger-utils'

export const comparatorFactory = (operator: string) => (arg: any) =>
  isUndefined(arg)
    ? [operator]
    : [operator, arg]

export const inFactory = (operator: string) => (...args: any[]) =>
  (args.length === 1 && isArray(args[0]))
    ? { [operator]: args[0] }
    : { [operator]: [...args] }

export const eq      = comparatorFactory('=')
export const lt      = comparatorFactory('<')
export const le      = comparatorFactory('<=')
export const gt      = comparatorFactory('>')
export const ge      = comparatorFactory('>=')
export const ne      = comparatorFactory('!=')
export const isIn    = inFactory('isIn')
export const notIn   = inFactory('notIn')
export const isNull  = () => ({ isNull: true })
export const notNull = () => ({ notNull: true })