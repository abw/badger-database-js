#!/usr/bin/env tsx
import { generateTypes, outputTypes } from '../src/Utils/TypeGen'

const tt = generateTypes({
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

const output = outputTypes(
  tt,
  { databaseTypeName: 'MusicDatabase' }
)
console.log(output)

