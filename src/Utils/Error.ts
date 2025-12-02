import { fail, format } from '@abw/badger-utils'

//-----------------------------------------------------------------------------
// General purpose error messages
//-----------------------------------------------------------------------------
/**
 * Function to throw a generic error used to report a missing configration item.
 * The error message will be of the form `No "XXX" specified`.
 * @example
 * ```ts
 * missing('badger');   // throws error: No "badger" specified
 * ```
 */
export const missing = (item: string) =>
  fail(`No "${item}" specified`)

/**
 * Function to throw a generic error used to report an invalid configuration
 * item. The error message will be of the form `Invalid "XXX" specified: YYY`.
 * @example
 * ```ts
 * invalid('badger', 99);   // throws error: Invalid "badger" specified: 99
 * ```
 */
export const invalid = (item: string, value: any) =>
  fail(`Invalid "${item}" specified: ${value}`)

/**
 * Function to throw a generic error reporting that a method is not implemented.
 * This is used in base classes (e.g. {@link Engine}) where subclasses are
 * required to implement the method. The error message will be of the form
 * `METHOD is not implemented in MODULE`.
 * @example
 * ```ts
 * notImplemented('wibble', 'FrussetPouch');  // throws error: wibble is not implemented in FrussetPouch
 * ```
 */
export const notImplemented = (method: string, module: string) =>
  fail(`${method} is not implemented in ${module}`)

/**
 * Currying function used to generate a function that calls {@link notImplemented}
 * with the module name pre-defined.
 * @param {!String} module - the name of the module
 * @example
 * ```ts
 * const thrower = notImplementedInModule('FrussetPouch');
 * thrower('wibble');  // throws error: wibble is not implemented in FrussetPouch
 * ```
 */
export const notImplementedInModule = (module: string) => (method: string) =>
  notImplemented(method, module)

/**
 * Wrapper around {@link notImplementedInModule} which provides a
 * more explicit error message for base classes.
 * @param {!String} module - the name of the module
 * @example
 * ```ts
 * const thrower = notImplementedInModule('FrussetPouch');
 * thrower('wibble');  // throws error: wibble is not implemented in the FrussetPouch base class
 * ```
 */
export const notImplementedInBaseClass = (module: string) =>
  notImplementedInModule(`the ${module} base class`)

//-----------------------------------------------------------------------------
// Custom error classes
//-----------------------------------------------------------------------------
/**
 * Error class for generating custom errors.
 */
export class CustomError extends Error {
  // public message: string
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

interface SQLParseErrorArgs  {
  message:   string,
  type?:     string | number
  code?:     string | number
  position?: string | number
  stack?:    typeof Error.prototype.stack
}

export class SQLParseError extends Error {
  query?:    string
  type?:     string | number
  code?:     string | number
  position?: string | number
  stack?:    typeof Error.prototype.stack

  constructor(query: string, args: SQLParseErrorArgs) {
    super(args.message);
    this.name  = this.constructor.name;
    this.query = query
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
export const throwEngineDriver = (module: string, error: Error) => {
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
 * Error class for reporting transaction errors
 */
export class TransactionError extends CustomError { }

/**
 * Function for throwing a {@link UnexpectedRowCount} error when multiple
 * rows were returned or updated when only one was expected.
 * @example
 * ```ts
 * // throw UnexpectedRowCount error with message "10 rows were returned when one was expected"
 * unexpectedRowCount(10);
 * ```
 * @example
 * ```ts
 * // throw UnexpectedRowCount error with message "10 rows were updated when one was expected"
 * unexpectedRowCount(10, 'updated');
 * ```
 */
export function unexpectedRowCount(n: number, action='returned') {
  throw new UnexpectedRowCount(`${n} rows were ${action} when one was expected`)
}

/**
 * Function to construct a function for throwing errors of a particular type
 * using message formats.  The function returned expects a format name and
 * an optional object containing values to insert into the message format.
 * @example
 * ```ts
 * const hurl = thrower({ oops => 'Unexpected <animal> encountered });
 * hurl('oops', 'badger');  // throws error: Unexpected badger encountered
 * ```
 */
export const thrower = <T extends Record<string,string>>(
  formats: T,
  error: new (message: string) => Error = Error,
) =>
  (fmt: keyof T, data: object) => {
    const message = format(
      formats[fmt] || fail("Invalid message format: ", fmt as string),
      data
    );
    throw new error(message)
  }

const COLUMN_VALIDATION_ERRORS = {
  unknown:            'Unknown "<column>" column in the <table> table',
  readonly:           'The "<column>" column is readonly in the <table> table',
  fixed:              'The "<column>" column is fixed in the <table> table',
  required:           'Missing required column "<column>" for the <table> table',
  multipleIds:        'Multiple columns are marked as "id" in the <table> table (<ids>)',
  noColumns:          'No columns specified for the <table> table',
  invalidKey:         'Invalid column specified as a key for the <table> table: <key>',
  invalidColumns:     'Invalid columns specified for the <table> table: <columns>',
  invalidColumn:      'Invalid column specification for <table>.<column> (<reason>)',
  invalidColumnSpec:  'Invalid column specification for <table>.<column>: <spec> (<reason>)',
}

/**
 * Error throwing function for column validation errors.
 * @example
 * ```ts
 * throwColumnValidationError('readonly', { table: 'users', column: 'id' });
 * // throws ColumnValidationError: The "id" column is readonly in the users table
 * ```
 */
export const throwColumnValidationError = thrower<typeof COLUMN_VALIDATION_ERRORS>(
  COLUMN_VALIDATION_ERRORS,
  ColumnValidationError
)

const DELETE_ERRORS =   {
  action: 'Cannot <action> deleted <table> record #<id>',
}

/**
 * Error throwing function for deleted record errors.
 * @example
 * ```ts
 * throwDeletedRecordError('action', { action: 'update', table: 'users', id: 99 });
 * // throws DeletedRecordError: Cannot update deleted users record #99
 * ```
 */
export const throwDeletedRecordError = thrower<typeof DELETE_ERRORS>(
  DELETE_ERRORS,
  DeletedRecordError
)
