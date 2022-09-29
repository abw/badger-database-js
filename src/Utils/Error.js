import { fail } from "@abw/badger-utils"
import { format } from "./Format.js"

//-----------------------------------------------------------------------------
// General purpose error messages
//-----------------------------------------------------------------------------
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

//-----------------------------------------------------------------------------
// Custom error classes
//-----------------------------------------------------------------------------

export class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnexpectedRowCount extends CustomError { }

export function unexpectedRowCount(n) {
  throw new UnexpectedRowCount(`${n} rows were returned when one was expected`)
}

export class ColumnValidationError extends CustomError { }
export class InsertValidationError extends CustomError { }

export const thrower = (formats, error=Error) =>
  (fmt, data) => {
    const message = format(
      formats[fmt] || fail("Invalid message format: ", fmt),
      data
    );
    throw new error(message)
  }
