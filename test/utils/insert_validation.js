import test from "ava"
import { InsertValidationError, thrower } from "../../src/Utils/Error.js"

const throwInsertValidationError = thrower(
  {
    unknown:  'Cannot insert unknown "<column>" column into <table> table',
    readonly: 'Cannot insert "<column>" readonly column into <table> table',
  },
  InsertValidationError
)

test(
  'unknown insert validation error',
  t => {
    const error = t.throws(
      () => throwInsertValidationError('unknown', { column: 'wibble', table: 'users'} )
    )
    t.is( error.message, 'Cannot insert unknown "wibble" column into users table' );
    t.is( error instanceof InsertValidationError, true );
  }
)

test(
  'readonly insert validation error',
  t => {
    const error = t.throws(
      () => throwInsertValidationError('readonly', { column: 'wibble', table: 'users'} )
    )
    t.is( error.message, 'Cannot insert "wibble" readonly column into users table' );
    t.is( error instanceof InsertValidationError, true );
  }
)

test(
  'missing format for insert validation error',
  t => {
    const error = t.throws(
      () => throwInsertValidationError('missing', { column: 'wibble', table: 'users'} )
    )
    t.is( error.message, 'Invalid message format: missing' );
  }
)