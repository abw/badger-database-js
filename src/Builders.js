import After    from './Builder/After.js';
import Before   from './Builder/Before.js';
import Columns  from './Builder/Columns.js';
import Database from './Builder/Database.js';
import From     from './Builder/From.js';
import Group    from './Builder/Group.js';
import Having   from './Builder/Having.js';
import Join     from './Builder/Join.js';
import Limit    from './Builder/Limit.js';
import Offset   from './Builder/Offset.js';
import Order    from './Builder/Order.js';
import Prefix   from './Builder/Prefix.js';
import Range    from './Builder/Range.js';
import Select   from './Builder/Select.js';
import Table    from './Builder/Table.js';
import Where    from './Builder/Where.js';
import Proxy    from './Proxy/Builder.js';

export let Builders = { };

export const registerBuilder = (name, module) => {
  Builders[name] = module
}

export const registerBuilders = (builders) =>
  Object.entries(builders).forEach(
    engine => registerBuilder(...engine)
  )

registerBuilders({
  after:     After,
  before:    Before,
  columns:   Columns,
  from:      From,
  group:     Group,
  groupBy:   Group,
  having:    Having,
  join:      Join,
  limit:     Limit,
  offset:    Offset,
  order:     Order,
  orderBy:   Order,
  prefix:    Prefix,
  range:     Range,
  select:    Select,
  table:     Table,
  where:     Where,
});

export const factory = (parent, type, ...args) => {
  return new Builders[type](factory, parent, ...args);
}

export const databaseBuilder = database =>
  Proxy(Builders, new Database(factory, undefined, database))

export const tableBuilder = table =>
  Proxy(Builders, new Table(factory, undefined, table))

export default factory;