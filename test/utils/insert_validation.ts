import { expect, test } from 'vitest'
import { InsertValidationError, thrower } from '../../src/Utils/Error'

const throwInsertValidationError = thrower(
  {
    unknown:  'Cannot insert unknown "<column>" column into <table> table',
    readonly: 'Cannot insert "<column>" readonly column into <table> table',
  },
  InsertValidationError
)

test( 'unknown insert validation error',
  () => {
    expect(
      () => throwInsertValidationError(
        'unknown',
        { column: 'wibble', table: 'users'}
      )
    ).toThrowError(
      'Cannot insert unknown "wibble" column into users table'
    )
    expect(
      () => throwInsertValidationError(
        'unknown',
        { column: 'wibble', table: 'users'}
      )
    ).toThrowError(
      InsertValidationError
    );
  }
)

test( 'readonly insert validation error',
  () => {
    expect(
      () => throwInsertValidationError(
        'readonly',
        { column: 'wibble', table: 'users'}
      )
    ).toThrowError(
      'Cannot insert "wibble" readonly column into users table'
    )
    expect(
      () => throwInsertValidationError(
        'readonly',
        { column: 'wibble', table: 'users'}
      )
    ).toThrowError(
      InsertValidationError
    )
  }
)

test( 'missing format for insert validation error',
  () => {
    expect(
      // @ts-expect-error: testing invalid message format
      () => throwInsertValidationError('missing', { column: 'wibble', table: 'users'} )
    ).toThrowError(
      'Invalid message format: missing'
    )
  }
)
