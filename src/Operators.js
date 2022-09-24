// work in progress / experiment

import After     from './Operator/After.js';
import Before    from './Operator/Before.js';
import From      from './Operator/From.js';
import Group     from './Operator/Group.js';
import Having    from './Operator/Having.js';
import Join      from './Operator/Join.js';
import Order     from './Operator/Order.js';
import Select    from './Operator/Select.js';
import Where     from './Operator/Where.js';

export const operators = {
  after:     After,
  before:    Before,
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
  return new operators[type](factory, parent, ...args);
}

export default factory;