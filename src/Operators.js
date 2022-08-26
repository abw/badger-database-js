// work in progress / experiment

import Select from './Operator/Select.js';
import From from './Operator/From.js';
import Where from './Operator/Where.js';

const operators = {
  select: Select,
  from: From,
  where: Where,
  whence: Where,
}

export const factory = (parent, type, ...args) => {
  console.log('factory [%s] => ', type, args);
  return new operators[type](factory, parent, ...args);
}

export default factory;