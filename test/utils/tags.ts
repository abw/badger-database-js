import { expect, test } from 'vitest'
import { sql } from '../../src/Utils/index'

//--------------------------------------------------------------------------
// sql
//--------------------------------------------------------------------------
test( 'sql`hello`',
  () => expect( sql`hello` ).toStrictEqual({ sql: ['hello'] })
)

