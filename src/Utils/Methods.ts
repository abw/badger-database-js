import { fail } from '@abw/badger-utils'

export const aliasMethods = (
  object: Record<string, any>,
  aliases: Record<string, string>
) =>
  Object.entries(aliases).map(
    ([alias, method]) => object[alias] = object[method]
      || fail(`Invalid alias "${alias}" references non-existent method "${method}"`)
  )
