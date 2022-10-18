import { fail } from "@abw/badger-utils"
import { format } from "./Format.js"

//-----------------------------------------------------------------------------
// General purpose error messages
//-----------------------------------------------------------------------------
/**
 * Function to throw a generic error used to report a missing configration item.
 * The error message will be of the form `No "XXX" specified`.
 * @param {!String} item - the name of the missing item
 * @example
 * missing('badger');   // throws error: No "badger" specified
 */
export const missing = (item) =>
  fail(`No "${item}" specified`)

/**
 * Function to throw a generic error used to report an invalid configration item.
 * The error message will be of the form `Invalid "XXX" specified: YYY`.
 * @param {!String} item - the name of the invalid item
 * @param value - the value of the invalid item
 * @example
 * invalid('badger', 99);   // throws error: Invalid "badger" specified: 99
 */
export const invalid = (item, value) =>
  fail(`Invalid "${item}" specified: ${value}`)

/**
 * Function to throw a generic error reporting that a method is not implemented.
 * This is used in base classes (e.g. {@link Engine}) where subclasses are
 * required to implement the method.
 * The error message will be of the form `METHOD is not implemented in MODULE`.
 * @param {!String} method - the name of the method
 * @param {!String} module - the name of the module
 * @example
 * notImplemented('wibble', 'FrussetPouch');  // throws error: wibble is not implemented in FrussetPouch
 */
export const notImplemented = (method, module) =>
  fail(`${method} is not implemented in ${module}`)

/**
 * Currying function used to generate a function that calls {@link notImplemented}
 * with the module name pre-defined.
 * @param {!String} module - the name of the module
 * @example
 * const thrower = notImplementedInModule('FrussetPouch');
 * throws('wibble');  // throws error: wibble is not implemented in FrussetPouch
 */
export const notImplementedInModule = module => method =>
  notImplemented(method, module)

/**
 * Wrapper around {@link notImplementedInModule} which provides a
 * more explicit error message for base classes.
 * @param {!String} module - the name of the module
 * @example
 * const thrower = notImplementedInModule('FrussetPouch');
 * throws('wibble');  // throws error: wibble is not implemented in the FrussetPouch base class
 */
export const notImplementedInBaseClass = module =>
  notImplementedInModule(`the ${module} base class`)

//-----------------------------------------------------------------------------
// Custom error classes
//-----------------------------------------------------------------------------
/**
 * Error class for generating custom errors.
 */
export class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SQLParseError extends Error {
  constructor(query, args) {
    super(args.message);
    this.name  = this.constructor.name;
    this.query = query;
    this.type  = args.type;
    this.code  = args.code;
    this.position = args.position;
    if (args.stack) {
      this.stack = args.stack;
    }
  }
}

/**
 * Error class for reporting failure to load engine driver
 */
export class EngineDriverError extends CustomError { }
export const throwEngineDriver = (module, error) => {
  throw new EngineDriverError(
    `Failed to load "${module}" engine driver module.  Have you installed it?\nError: ` + error.message
  )
}

/**
 * Error class for reporting unexpected number of rows returned by a
 * database query.
 */
export class UnexpectedRowCount extends CustomError { }

/**
 * Error class for reporting columns validation errors, e.g. when
 * attempting to update a `readonly` column.
 */
export class ColumnValidationError extends CustomError { }

/**
 * Error class for reporting validation errors when inserting a row.
 */
export class InsertValidationError extends CustomError { }

/**
 * Error class for reporting attempts to update a deleted record.
 */
export class DeletedRecordError extends CustomError { }

/**
 * Error class for reporting query builder errors
 */
export class QueryBuilderError extends CustomError { }

/**
 * Function for throwing a {@link UnexpectedRowCount} error when multiple
 * rows were returned or updated when only one was expected.
 * @param {!Integer} n - the number of rows encountered
 * @param {String} [action=returned] - the action that was being performed.
 * @example
 * // throw UnexpectedRowCount error with message "10 rows were returned when one was expected"
 * unexpectedRowCount(10);
 * @example
 * // throw UnexpectedRowCount error with message "10 rows were updated when one was expected"
 * unexpectedRowCount(10, 'updated');
 */
export function unexpectedRowCount(n, action='returned') {
  throw new UnexpectedRowCount(`${n} rows were ${action} when one was expected`)
}

/**
 * Function to contruct a function for throwing errors of a particular type
 * using message formats.  The function returned expects a format name and
 * an optional object containing values to insert into the message format.
 * @param {!Object} formats - an object mapping short names to message formats
 * @param {Error} [error=Error] - the error type
 * @example
 * const hurl = thrower({ oops => 'Unexpected <animal> encountered });
 * hurl('oops', 'badger');  // throws error: Unexpected badger encountered
 */
export const thrower = (formats, error=Error) =>
  (fmt, data) => {
    const message = format(
      formats[fmt] || fail("Invalid message format: ", fmt),
      data
    );
    throw new error(message)
  }

/**
 * Error throwing function for column validation errors.
 */
export const throwColumnValidationError = thrower(
  {
    unknown:        'Unknown "<column>" column in the <table> table',
    readonly:       'The "<column>" column is readonly in the <table> table',
    fixed:          'The "<column>" column is fixed in the <table> table',
    required:       'Missing required column "<column>" for the <table> table',
    multipleIds:    'Multiple columns are marked as "id" in the <table> table',
    noColumns:      'No "columns" specified for the <table> table',
    invalidColumns: 'Invalid "columns" specified for the <table> table: <columns>',
  },
  ColumnValidationError
)

/**
 * Error throwing function for deleted record errors.
 */
export const throwDeletedRecordError = thrower(
  {
    action: 'Cannot <action> deleted <table> record #<id>',
  },
  DeletedRecordError
)
