import { hasValue, splitList } from '@abw/badger-utils'
import Builder, { Builders, Generators } from './Builder.js'
import After     from './Builder/After'
import Before    from './Builder/Before'
import Columns   from './Builder/Columns'
import Database  from './Builder/Database'
import Delete    from './Builder/Delete'
import From      from './Builder/From'
import Group     from './Builder/Group'
import Having    from './Builder/Having'
import Insert    from './Builder/Insert'
import Into      from './Builder/Into'
import Join      from './Builder/Join'
import Limit     from './Builder/Limit'
import Offset    from './Builder/Offset'
import Order     from './Builder/Order'
import Prefix    from './Builder/Prefix'
import Range     from './Builder/Range'
import Returning from './Builder/Returning'
import Select    from './Builder/Select'
import Set       from './Builder/Set'
import Table     from './Builder/Table'
import Update    from './Builder/Update'
import Values    from './Builder/Values';
import Where     from './Builder/Where'
import Proxy     from './Proxy/Builder.js';
import { DatabaseInstance } from './types'

export const registerBuilder = (module: typeof Builder) => {
  const slot  = module.contextSlot || module.buildMethod;
  const order = module.buildOrder;

  /*
  const method = module.buildMethod;
  const alias  = splitList(module.buildAlias);
  console.log('register [%s] as', [method, ...alias]);
  console.log('register [%s] => [slot:%s] [order:%s]', method, slot, order);
  */

  // Register the main buildMethod and any buildAlias in the Builders table.
  // Multiple aliases can be specified in buildAlias as an array or string which
  // will be split on commas and/or whitespace.  This is what we use to map builder
  // methods, e.g. select().from(), etc., onto the relevant modules.
  [module.buildMethod, ...splitList(module.buildAlias)].forEach(
    (name: string) => Builders[name] = module
  )

  // Builder modules have a slot that they use in the context.  Sometimes multiple
  // builders can share the same slot (e.g. Columns and Select both use "select").
  // When we're rendering a builder chain we first generate a context (which may be
  // cached) in which each builder object instance adds their fragments of SQL to the
  // array in their context slot, e.g. from('table1').from(['table2', 'alias']) will
  // result in the "from" slot containing: ['"table1"', '"table2" as "alias"'].  Then
  // we need to go through those slots in a particular order (e.g. select, from,
  // join, where, etc) determined by each module's static buildOrder parameter and look
  // to see if the corresponding slot has anything in it.  If it does, we call the
  // module's static generateSQL() method to generate the complete SQL fragment,
  // e.g. 'FROM "table1", "table2" as "alias"'
  if (slot && hasValue(order)) {
    Generators[slot] = [module, order];
  }
}

export const registerBuilders = (...builders) =>
  builders.forEach(registerBuilder)

registerBuilders(
  After, Before, Columns, Delete, From, Group, Having,
  Insert, Into, Join, Limit, Offset, Order, Prefix, Range,
  Returning, Select, Set, Table, Update, Values, Where,
);

export const databaseBuilder = (database: DatabaseInstance) =>
  Proxy(Builders, new Database(undefined, database))

export const tableBuilder = (table: string) =>
  Proxy(Builders, new Table(undefined, table))

