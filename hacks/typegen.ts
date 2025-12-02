#!/usr/bin/env tsx
import { generateTableTypes, generateTypes, outputTablesTypes } from '../src/Utils/TypeGen'

const tt = generateTypes({
  tables: {
    artists: {
      columns: 'id:fixed:type=number name:required:type=string'
    },
    albums: {
      columns: 'album_id:readonly:id:type=number artist_id:required:type=number name:required year:type=string'
    }
  }
})

// console.log('Generated Types:', tt)

const output = outputTablesTypes(tt)
console.log(output)

// const g = generateTableTypes('artists', tt.artists)
// console.log('artists:', g)