import { expect, test } from 'vitest'
import {
  missing, invalid, notImplemented, notImplementedInModule,
  notImplementedInBaseClass, throwEngineDriver,
  unexpectedRowCount,
  throwColumnValidationError,
  throwDeletedRecordError
} from '../../src/Utils'

test( 'missing()',
  () => expect(
    () => missing('badger')
  ).toThrowError(
    'No "badger" specified'
  )
)

test( 'invalid()',
  () => expect(
    () => invalid('animal', 'ferret')
  ).toThrowError(
    'Invalid "animal" specified: ferret'
  )
)

test( 'notImplemented()',
  () => expect(
    () => notImplemented('wibble', 'FrussetPouch')
  ).toThrowError(
    'wibble is not implemented in FrussetPouch'
  )
)

test( 'notImplementedInModule()',
  () => {
    const thrower = notImplementedInModule('FrussetPouch');
    expect(
      () => thrower('wibble')
    ).toThrowError(
      'wibble is not implemented in FrussetPouch'
    )
  }
)

test( 'notImplementedInBaseClass()',
  () => {
    const thrower = notImplementedInBaseClass('FrussetPouch');
    expect(
      () => thrower('wibble')
    ).toThrowError(
      'wibble is not implemented in the FrussetPouch base class'
    )
  }
)

test( 'throwEngineDriver()',
  () =>expect(
    () => throwEngineDriver('BadgerSQL', new Error('this went wrong'))
  ).toThrowError(
    'Failed to load "BadgerSQL" engine driver module.  Have you installed it?\nError: this went wrong'
  )
)

test( 'unexpectedRowCount() with default action',
  () =>expect(
    () => unexpectedRowCount(11)
  ).toThrowError(
    '11 rows were returned when one was expected'
  )
)

test( 'unexpectedRowCount() with custom action',
  () =>expect(
    () => unexpectedRowCount(11, 'barfed out of the database')
  ).toThrowError(
    '11 rows were barfed out of the database when one was expected'
  )
)

test( 'throwColumnValidationError()',
  () =>expect(
    () => throwColumnValidationError(
      'invalidColumn',
      { table: 'artists', column: 'volume', reason: 'it went one louder' }
    )
  ).toThrowError(
    'Invalid column specification for artists.volume (it went one louder)'
  )
)

test( 'throwDeletedRecordError()',
  () =>expect(
    () => throwDeletedRecordError(
      'action',
      { table: 'artists', action: 'amplify', id: 11 }
    )
  ).toThrowError(
    'Cannot amplify deleted artists record #11'
  )
)
