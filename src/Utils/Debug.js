import { addDebug } from "@abw/badger";
import { fail, isBoolean, isObject } from "@abw/badger-utils";

export let debug = {
  database: {
    debug:  false,
    prefix: 'Database> ',
    color:  'green',
  },
  engine: {
    debug:  false,
    prefix: 'Engine> ',
    color:  'red',
  },
  queries: {
    debug:  false,
    prefix: 'Queries> ',
    color:  'blue',
  },
  table: {
    debug:  false,
    prefix: 'Table> ',
    color:  'yellow',
  },
  record: {
    debug:  false,
    prefix: 'Record> ',
    color:  'green',
  },
  test: {
    debug:  false,
    prefix: 'Test> ',
    color:  'green'
  },
}

const invalidDebugItem = item =>
  fail(`Invalid debug item "${item}" specified`)

export const setDebug = options => {
  Object.entries(options).map(
    ([key, value]) => {
      const set = debug[key] || invalidDebugItem(key);
      if (isBoolean(value)) {
        set.debug = value;
      }
      else if (isObject(value)) {
        Object.assign(set, value);
      }
    }
  )
}

export const getDebug = (name, ...configs) => {
  const defaults = debug[name] || invalidDebugItem(name);
  return Object.assign(
    {},
    defaults,
    ...configs
  );
}

export const addDebugMethod = (object, name, ...configs) => {
  const options = getDebug(name, ...configs);
  addDebug(
    object,
    options.debug,
    options.debugPrefix || options.prefix,
    options.debugColor  || options.color
  );
}