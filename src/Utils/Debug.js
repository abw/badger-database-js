import { addDebug, ANSIescape, ANSIreset } from "@abw/badger";
import { doNothing, fail, isBoolean, isObject } from "@abw/badger-utils";

export let debug = {
  database: {
    debug:  false,
    prefix: 'Database -> ',
    color:  'bright magenta',
  },
  engine: {
    debug:  false,
    prefix: 'Engine ---> ',
    color:  'red',
  },
  queries: {
    debug:  false,
    prefix: 'Queries --> ',
    color:  'blue',
  },
  table: {
    debug:  false,
    prefix: 'Table ----> ',
    color:  'bright cyan',
  },
  record: {
    debug:  false,
    prefix: 'Record ---> ',
    color:  'green',
  },
  test: {
    debug:  false,
    prefix: 'Test     -> ',
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
  const enabled = options.debug;
  const prefix  = options.debugPrefix || options.prefix;
  const color   = options.debugColor  || options.color;
  addDebug(object, enabled, prefix, color);
  object.debugData = DataDebugger(enabled, prefix, color);
}

export function DataDebugger(enabled, prefix, color, length=10) {
  return enabled
    ? (message, data={}) => {
        console.log(
          '%s' + prefix + '%s' + message,
          color ? ANSIescape(color) : '',
          color ? ANSIreset() : ''
        );
        Object.entries(data).map(
          ([key, value]) => console.log(
            '%s' + key.padStart(length, ' ') + '%s:',
            color ? ANSIescape(color) : '',
            color ? ANSIreset() : '',
            value
          )
        )
      }
    : doNothing;
}
