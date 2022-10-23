import { hasValue, splitList } from '@abw/badger-utils';
import { Builders, Generators } from './Builder.js';
import After     from './Builder/After.js';
import Before    from './Builder/Before.js';
import Columns   from './Builder/Columns.js';
import Database  from './Builder/Database.js';
import Delete    from './Builder/Delete.js';
import From      from './Builder/From.js';
import Group     from './Builder/Group.js';
import Having    from './Builder/Having.js';
import Insert    from './Builder/Insert.js';
import Into      from './Builder/Into.js';
import Join      from './Builder/Join.js';
import Limit     from './Builder/Limit.js';
import Offset    from './Builder/Offset.js';
import Order     from './Builder/Order.js';
import Prefix    from './Builder/Prefix.js';
import Range     from './Builder/Range.js';
import Returning from './Builder/Returning.js';
import Select    from './Builder/Select.js';
import Set       from './Builder/Set.js';
import Table     from './Builder/Table.js';
import Update    from './Builder/Update.js';
import Values    from './Builder/Values.js';
import Where     from './Builder/Where.js';
import Proxy     from './Proxy/Builder.js';

export const registerBuilder = module => {
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
    name => Builders[name] = module
  )

  // Builder modules have a slot that they use in the context.  Sometimes multiple
  // builders can share the same slot (e.g. Columns and Select both use "select").
  // When we're rendering a builder chain we first generate a context (which may be
  // cached) in which each builder object instance adds theor fragments of SQL to the
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

export const databaseBuilder = database =>
  Proxy(Builders, new Database(undefined, database))

export const tableBuilder = table =>
  Proxy(Builders, new Table(undefined, table))

