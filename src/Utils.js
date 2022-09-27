import { fail } from "@abw/badger-utils"

export const missing = (item) =>
  fail(`No "${item}" specified`)

export const invalid = (item, value) =>
  fail(`Invalid "${item}" specified: ${value}`)

export const notImplemented = (method, module) =>
  fail(`${method} is not implemented in ${module}`)

export const notImplementedInModule = module => method =>
  notImplemented(method, module)

export const notImplementedInBaseClass = module =>
  notImplementedInModule(`the ${module} base class`)

