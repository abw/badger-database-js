// work in progress / experiment
import After    from './Builder/After.js';
import Before   from './Builder/Before.js';
import Columns  from './Builder/Columns.js';
import Database from './Builder/Database.js';
import From     from './Builder/From.js';
import Group    from './Builder/Group.js';
import Having   from './Builder/Having.js';
import Join     from './Builder/Join.js';
import Order    from './Builder/Order.js';
import Select   from './Builder/Select.js';
import Table    from './Builder/Table.js';
import Where    from './Builder/Where.js';
import Proxy    from './Proxy/Builder.js';

export const builders = {
  after:     After,
  before:    Before,
  columns:   Columns,
  from:      From,
  group:     Group,
  groupBy:   Group,
  having:    Having,
  join:      Join,
  order:     Order,
  orderBy:   Order,
  select:    Select,
  where:     Where,
}

export const factory = (parent, type, ...args) => {
  // console.log('factory [%s] => ', type);
  return new builders[type](factory, parent, ...args);
}

export const databaseBuilder = database =>
  Proxy(new Database(factory, undefined, database))

export const tableBuilder = table =>
  Proxy(new Table(factory, undefined, table))

export default factory;