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
export class ColumnValidationError extends CustomError { }
export class InsertValidationError extends CustomError { }
export class DeletedRecordError extends CustomError { }

export function unexpectedRowCount(n, action='returned') {
  throw new UnexpectedRowCount(`${n} rows were ${action} when one was expected`)
}


export const thrower = (formats, error=Error) =>
  (fmt, data) => {
    const message = format(
      formats[fmt] || fail("Invalid message format: ", fmt),
      data
    );
    throw new error(message)
  }

export const throwColumnValidationError = thrower(
  {
    unknown:        'Unknown "<column>" column in the <table> table',
    readonly:       'The "<column>" column is readonly in the <table> table',
    required:       'Missing required column "<column>" for the <table> table',
    multipleIds:    'Multiple columns are marked as "id" in the <table> table',
    noColumns:      'No "columns" specified for the <table> table',
    invalidColumns: 'Invalid "columns" specified for the <table> table: <columns>',
  },
  ColumnValidationError
)

export const throwDeletedRecordError = thrower(
  {
    action: 'Cannot <action> deleted <table> record #<id>',
  },
  DeletedRecordError
)
