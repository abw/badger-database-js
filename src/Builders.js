import { splitList } from '@abw/badger-utils';
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

export const registerBuilder = module => {
  //const method = module.buildMethod;
  //const alias  = splitList(module.buildAlias);
  // console.log('register [%s] as', name, [method, ...alias]);
  [module.buildMethod, ...splitList(module.buildAlias)].forEach(
    name => Builders[name] = module
  )
}

export const registerBuilders = (...builders) =>
  builders.forEach(registerBuilder)

registerBuilders(
  After,
  Before,
  Columns,
  From,
  Group,
  Having,
  Join,
  Limit,
  Offset,
  Order,
  Prefix,
  Range,
  Select,
  Table,
  Where,
);

export const OLDregisterBuilder = (name, module) => {
  Builders[name] = module
}

export const OLDregisterBuilders = (builders) =>
  Object.entries(builders).forEach(
    engine => registerBuilder(...engine)
  )

OLDregisterBuilders({
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

//export const factory = (parent, type, ...args) => {
//  return new Builders[type](parent, ...args);
//}

export const databaseBuilder = database =>
  Proxy(Builders, new Database(undefined, database))

export const tableBuilder = table =>
  Proxy(Builders, new Table(undefined, table))

// export default factory;