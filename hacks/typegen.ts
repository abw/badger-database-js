#!/usr/bin/env tsx
import { generateDatabaseTypes } from '../src/TypeGen/Generate'
import { outputDatabaseTypes } from '../src/TypeGen/Output'
import { inspect } from 'node:util'

const types = generateDatabaseTypes({
  name: 'music',
  tables: {
    artists: {
      columns: 'id:fixed:type=number name:required:type=string label:type=string volume:type=number'
    },
    albums: {
      // Short form:
      // columns: 'album_id:readonly:id:type=number artist_id:required:type=number name:required year'
      // Which is expanded to long form:
      columns: {
        album_id: {
          id: true,
          readonly: true,
          type: 'number',
        },
        artist_id: {
          required: true,
          type: 'number',
        },
        name: 'required',
        year: { },
      }
    }
  }
})

// console.log(
//   `types: `,
//   inspect(types, { depth: null, colors: true })
// );

const output = outputDatabaseTypes(types)
console.log(output)
