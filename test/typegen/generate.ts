import { defaultTableActionTypeNameGenerator, defaultTableTypeNameGenerator, generateTableTypeNames } from '@/src/TypeGen'
import { snakeToStudly } from '@abw/badger-utils'
import { expect, test } from 'vitest'

test( 'defaultTableTypeNameGenerator("artists")',
  () => expect(
    defaultTableTypeNameGenerator('artists')
  ).toEqual(
    'ArtistsTable'
  )
)

test( 'generateTableTypeName("space_cadets")',
  () => expect(
    defaultTableTypeNameGenerator('space_cadets')
  ).toEqual(
    'SpaceCadetsTable'
  )
)

test( 'defaultTableActionTypeNameGenerator("ArtistsTable", "select")',
  () => expect(
    defaultTableActionTypeNameGenerator('ArtistsTable', 'select')
  ).toEqual(
    'ArtistsTableSelectColumns'
  )
)

test( 'defaultTableActionTypeNameGenerator("ArtistsTable", "funky_monkey")',
  () => expect(
    defaultTableActionTypeNameGenerator('ArtistsTable', 'funky_monkey')
  ).toEqual(
    'ArtistsTableFunkyMonkeyColumns'
  )
)

test( 'generateTableTypeNames("artists")',
  () => expect(
    generateTableTypeNames('artists')
  ).toStrictEqual({
    table: 'ArtistsTable',
    insert: 'ArtistsTableInsertColumns',
    update: 'ArtistsTableUpdateColumns',
    select: 'ArtistsTableSelectColumns',
    delete: 'ArtistsTableDeleteColumns',
  })
)

test( 'generateTableTypeNames("artists") with custom table type generator',
  () => expect(
    generateTableTypeNames(
      'artists',
      {
        tableTypeNameGenerator: name =>
          `Table${snakeToStudly(name)}`
      }
    )
  ).toStrictEqual({
    table: 'TableArtists',
    insert: 'TableArtistsInsertColumns',
    update: 'TableArtistsUpdateColumns',
    select: 'TableArtistsSelectColumns',
    delete: 'TableArtistsDeleteColumns',
  })
)

test( 'generateTableTypeNames("artists") with custom table action type generator',
  () => expect(
    generateTableTypeNames(
      'artists',
      {
        tableTypeNameGenerator: name =>
          `Table${snakeToStudly(name)}`,
        tableActionTypeNameGenerator: (name, action) =>
          `${name}${snakeToStudly(action)}Action`
      }
    )
  ).toStrictEqual({
    table:  'TableArtists',
    insert: 'TableArtistsInsertAction',
    update: 'TableArtistsUpdateAction',
    select: 'TableArtistsSelectAction',
    delete: 'TableArtistsDeleteAction',
  })
)