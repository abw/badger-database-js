#!/usr/bin/env tsx

// Testing the use of an interface to define table columns acceptable for
// various operations: select, insert, update, etc.

interface Schema {
  tables: {
    Artists: {
      columns: {
        select: {
          id?: number
          name?: string
          email?: string
          password?: string
        }
        insert: {
          id?: number
          name: string
          email: string
          password?: string
        }
        update: {
          name?: string
          email?: string
          password?: string
        }
        identity: {
          id: number
        }
      }
    }
  }
}
