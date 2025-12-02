import { expect, test } from 'vitest'
import {
  prepareColumnFragments, prepareColumn, prepareColumnsArray,
  splitColumnFragments, prepareColumnsObject, prepareColumnsString,
  prepareColumns, prepareKeys
} from '../../src/Utils/Columns'


//--------------------------------------------------------------------------
// splitColumnFragments
//--------------------------------------------------------------------------
test( 'splitColumnFragments("readonly")',
  () => {
    expect(
      splitColumnFragments('artists', 'id', 'readonly')
    ).toStrictEqual([
      'readonly'
    ])
  }
)

test( 'splitColumnFragments("readonly:id:type=string")',
  () => {
    expect(
      splitColumnFragments('artists', 'id', 'readonly:id:type=string')
    ).toStrictEqual([
      'readonly', 'id', 'type=string'
    ])
  }
)

test( 'splitColumnFragments("readonly:broken:type=string") should throw error',
  () => {
    expect(
      () => splitColumnFragments('artists', 'id', 'readonly:broken:type=string')
    ).toThrowError("Invalid column specification for artists.id: readonly:broken:type=string ('broken' is not valid)")
  }
)

//--------------------------------------------------------------------------
// prepareColumnFragments() - mostly tested by prepareColumn()
//--------------------------------------------------------------------------
test( 'prepareColumnFragments()',
  () => {
    expect(
      prepareColumnFragments('artists', 'id', ['readonly', 'type=string'])
    ).toStrictEqual({
      column: 'id',
      tableColumn: 'artists.id',
      type: 'string',
      readonly: true
    })
  }
)

//--------------------------------------------------------------------------
// prepareColumn()
//--------------------------------------------------------------------------
test( 'prepareColumn("...")',
  () => {
    expect(
      prepareColumn('artists', 'id', 'readonly:type=number')
    ).toStrictEqual({
      column: 'id',
      readonly: true,
      type: 'number',
      tableColumn: 'artists.id'
    })
  }
)

test( 'prepareColumn("...") throws error with invalid fragment',
  () => {
    expect(
      () => prepareColumn('artists', 'id', 'readonly:busted:type=number')
    ).toThrowError("Invalid column specification for artists.id: readonly:busted:type=number ('busted' is not valid)")
  }
)

test( 'prepareColumn({ ... })',
  () => {
    expect(
      prepareColumn('artists', 'id', {
        readonly: true
      })
    ).toStrictEqual({
      column: 'id',
      readonly: true,
      tableColumn: 'artists.id'
    })
  }
)

test( 'prepareColumn({ ... }) throws error for invalid key',
  () => {
    expect(
      () => prepareColumn('artists', 'id', {
        readonly: true,
        // @ts-expect-error: testing error handling for invalid key
        noThanks: 'This should not be here'
      })
    ).toThrowError("Invalid column specification for artists.id ('noThanks' is not a valid key)")
  }
)

test( 'prepareColumn({ ... }) throws error for multiple invalid keys',
  () => {
    expect(
      () => prepareColumn('artists', 'id', {
        readonly: true,
        // @ts-expect-error: testing error handling for invalid key
        noThanks: 'This should not be here',
        eleven: 'One louder'
      })
    ).toThrowError("Invalid column specification for artists.id ('noThanks' and 'eleven' are not valid keys)")
  }
)

//--------------------------------------------------------------------------
// prepareColumnsObject()
//--------------------------------------------------------------------------
test( 'prepareColumnsObject()',
  () => {
    expect(
      prepareColumnsObject(
        'artists', {
          id:    'readonly:type=string',
          name:  'type=string',
          email: undefined,
          dob:   { },
        }
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'string',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        type: 'string',
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        // TODO: decide if default type should be added in sooner rather than later
        // type: 'string',
        column: 'email',
        tableColumn: 'artists.email'
      },
      dob: {
        // TODO: decide if default type should be added in sooner rather than later
        // type: 'string',
        column: 'dob',
        tableColumn: 'artists.dob'
      }
    })
  }
)

test( 'prepareColumnsObject() throws error from invalid fragment',
  () => {
    expect(
      () => prepareColumnsObject(
        'artists', {
          id:    'readonly:type=string:pants',
          name:  'type=string',
        }
      )
    ).toThrowError(
      "Invalid column specification for artists.id: readonly:type=string:pants ('pants' is not valid)"
    )
  }
)

test( 'prepareColumnsObject() throws error from invalid column type',
  () => {
    expect(
      () => prepareColumnsObject(
        'artists',
        // @ts-expect-error: Thanks TS, we're trying to test the runtime validation
        {
          id:    'readonly:type=string',
          number: 11,
        }
      )
    ).toThrowError(
      "Invalid column specification for artists.number: 11 (number is not a valid type)"
    )
  }
)

//--------------------------------------------------------------------------
// prepareColumnsArray()
//--------------------------------------------------------------------------
test( 'prepareColumnsArray()',
  () => {
    expect(
      prepareColumnsArray(
        'artists',
        [ 'id:readonly:type=number', 'name:required', 'email' ]
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'number',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        required: true,
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      }
    })
  }
)

//--------------------------------------------------------------------------
// prepareColumnsString()
//--------------------------------------------------------------------------
test( 'prepareColumnsString() whitespace delimited',
  () => {
    expect(
      prepareColumnsString(
        'artists',
        'id:readonly:type=number name:required email'
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'number',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        required: true,
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      }
    })
  }
)

test( 'prepareColumnsString() comma delimited',
  () => {
    expect(
      prepareColumnsString(
        'artists',
        'id:readonly:type=number, name:required,email'
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'number',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        required: true,
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      }
    })
  }
)

//--------------------------------------------------------------------------
// prepareColumns()
//--------------------------------------------------------------------------

test( 'prepareColumns() with object',
  () => {
    expect(
      prepareColumns(
        'artists', {
          id:    'readonly:type=string',
          name:  'type=string',
          email: undefined,
          dob:   { },
          manager: { column: 'management'},
        }
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'string',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        type: 'string',
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      },
      dob: {
        column: 'dob',
        tableColumn: 'artists.dob'
      },
      manager: {
        column: 'management',
        tableColumn: 'artists.management'
      }
    })
  }
)

test( 'prepareColumns() with array',
  () => {
    expect(
      prepareColumns(
        'artists',
        [ 'id:readonly:type=number', 'name:required', 'email' ]
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'number',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        required: true,
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      }
    })
  }
)

test( 'prepareColumns() with string',
  () => {
    expect(
      prepareColumns(
        'artists',
        'id:readonly:type=number name:required email'
      )
    ).toStrictEqual({
      id: {
        readonly: true,
        type: 'number',
        column: 'id',
        tableColumn: 'artists.id'
      },
      name: {
        required: true,
        column: 'name',
        tableColumn: 'artists.name'
      },
      email: {
        column: 'email',
        tableColumn: 'artists.email'
      }
    })
  }
)

test( 'prepareColumns() with none more columns',
  () => {
    expect(
      () => prepareColumns(
        'artists',
        undefined
      )
    ).toThrowError(
      'No columns specified for the artists table'
    )
  }
)

test( 'prepareColumns() with invalid columns',
  () => {
    expect(
      () => prepareColumns(
        'artists',
        // @ts-expect-error: testing runtime validation
        11
      )
    ).toThrowError(
      'Invalid columns specified for the artists table: 11'
    )
  }
)

//--------------------------------------------------------------------------
// prepareKeys()
//--------------------------------------------------------------------------

test( 'prepareKeys() with an explicit id column',
  () => {
    expect(
      prepareKeys(
        'artists',
        { id: 'artist_id', columns: 'not important here' },
        prepareColumns('artists', 'artist_id:readonly:type=number name:required:type=string')
      )
    ).toStrictEqual({
      id: 'artist_id',
      keys: [ 'artist_id' ]
    })
  }
)

test( 'prepareKeys() with explicit keys as string',
  () => {
    expect(
      prepareKeys(
        'artists',
        { keys: 'label_id artist_id', columns: 'not important here' },
        prepareColumns(
          'artists',
          'label_id:required:type=number artist_id:readonly:type=number name:required:type=string'
        )
      )
    ).toStrictEqual({
      keys: [ 'label_id', 'artist_id' ]
    })
  }
)

test( 'prepareKeys() with explicit keys as an array',
  () => {
    expect(
      prepareKeys(
        'artists',
        { keys: ['label_id', 'artist_id'], columns: 'not important here' },
        prepareColumns(
          'artists',
          'label_id:required:type=number artist_id:readonly:type=number name:required:type=string'
        )
      )
    ).toStrictEqual({
      keys: [ 'label_id', 'artist_id' ]
    })
  }
)

test( 'prepareKeys() with multiple columns having the key flag',
  () => {
    expect(
      prepareKeys(
        'artists',
        { columns: 'not important here' },
        prepareColumns(
          'artists',
          'label_id:required:key:type=number artist_id:readonly:key:type=number name:required:type=string'
        )
      )
    ).toStrictEqual({
      keys: [ 'label_id', 'artist_id' ]
    })
  }
)

test( 'prepareKeys() with a single column with the id flag set',
  () => {
    expect(
      prepareKeys(
        'artists',
        { columns: 'not important here' },
        prepareColumns(
          'artists',
          'artist_id:id:type=number name:required:type=string'
        )
      )
    ).toStrictEqual({
      id: 'artist_id',
      keys: [ 'artist_id' ]
    })
  }
)

test( 'prepareKeys() with multiple columns having the id flag set',
  () => {
    expect(
      () => prepareKeys(
        'artists',
        { columns: 'not important here' },
        prepareColumns(
          'artists',
          'label_id:id artist_id:id:type=number name:required:type=string'
        )
      )
    ).toThrowError(
      'Multiple columns are marked as "id" in the artists table ("label_id" and "artist_id")'
    )
  }
)

