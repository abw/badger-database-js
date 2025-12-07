#!/usr/bin/env tsx

import { Builders } from '../src'
import { SelectBuilderArg } from '../src/Builder/Select'
import { FromBuilderArg } from '../src/Builder/From'
import { BuilderInstance } from '../src/types'

type BuildSelect = (column: SelectBuilderArg, ...args: SelectBuilderArg[]) => SelectBuilderMethods
type BuildFrom = (table: FromBuilderArg, ...args: FromBuilderArg[]) => FromBuilderMethods
type BuildDelete = () => DeleteBuilderMethods

interface AllBuilderMethods {
  select: BuildSelect
  from:   BuildFrom
  delete: BuildDelete
}

type SelectBuilderMethods = Omit<AllBuilderMethods, 'delete'>
type DeleteBuilderMethods = Omit<AllBuilderMethods, 'select'>
type FromBuilderMethods = AllBuilderMethods

const foo: AllBuilderMethods

foo.select({ table: 'bar', columns: ['foo bar'] }).from('foo')


// console.log(`Builders: `, Builders)
