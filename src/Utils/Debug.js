import { addDebug, ANSIescape, ANSIreset } from "@abw/badger";
import { doNothing, fail, isBoolean, isObject } from "@abw/badger-utils";

/**
 * @ignore
 * Default width for debugging prefix column.
 */
const debugWidth = 16;

/**
 * @ignore
 * Default debugging options
 */
export let debug = {
  database: {
    debug:  false,
    prefix: 'Database',
    color:  'bright magenta',
  },
  engine: {
    debug:  false,
    prefix: 'Engine',
    color:  'red',
  },
  queries: {
    debug:  false,
    prefix: 'Queries',
    color:  'blue',
  },
  table: {
    debug:  false,
    prefix: 'Table',
    color:  'bright cyan',
  },
  record: {
    debug:  false,
    prefix: 'Record',
    color:  'green',
  },
  builder: {
    debug:  false,
    prefix: 'Builder',
    color:  'yellow',
  },
  test: {
    debug:  false,
    prefix: 'Test',
    color:  'green'
  },
}

/**
 * @ignore
 * Function to throw an error for an invalid debug option
 */
const invalidDebugItem = item =>
  fail(`Invalid debug item "${item}" specified`)

/**
 * Function to set debugging options.  Each key in the `options` should be
 * one of the components that supports debugging: `database`, `engine`, `queries`,
 * `table` or `record`.  The corresponding values should be a boolean value to
 * enable or disable debugging for the option or an object containing a `debug`
 * flag, and optionally, a `prefix` and/or `color`.
 * @param {!Object} options - debugging options
 * @example
 * setDebug({ engine: true })
 * @example
 * setDebug({
 *   engine: {
 *     debug: true,
 *     prefix: 'Choo Choo!',
 *     color: 'green'
 *   }
 * })
 */
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

/**
 * Function to get debugging options for one of the components that supports debugging:
 * `database`, `engine`, `queries`, `table` or `record`.  One or more additional
 * objects can be passed that contain further configuration options. The returned object
 * will contained a merged set of the defaults and those options.
 * @param {!String} name - debugging options
 * @param {...Object} configs - additional debugging options
 * @example
 * getDebug('engine')
 * @example
 * getDebug('engine', { debug: true })
 * @example
 * getDebug('engine', { debug: true, color: 'green' })
 * @example
 * getDebug('engine', { debug: true }, { color: 'green' })
 */
export const getDebug = (name, ...configs) => {
  const defaults = debug[name] || invalidDebugItem(name);
  return Object.assign(
    {},
    defaults,
    ...configs
  );
}

/**
 * Function to add the `debug()` and `debugData()` methods to an object.
 * `database`, `engine`, `queries`, `table` or `record`.  One or more additional
 * objects can be passed that contain further configuration options. The returned object
 * will contained a merged set of the defaults and those options.
 * @param {!Object} object - object to receive methods
 * @param {!String} name - name of component type
 * @param {...Object} configs - additional debugging options
 * @example
 * addDebugMethod(myObject, 'engine', { debug: true })
 * @example
 * getDebug(myObject, 'engine', { debug: true }, { color: 'green' })
 */
export const addDebugMethod = (object, name, ...configs) => {
  const options = getDebug(name, ...configs);
  const enabled = options.debug;
  const prefix  = options.debugPrefix || options.prefix;
  const color   = options.debugColor  || options.color;
  const preline = prefix.length > debugWidth - 2
    ? prefix + "\n" + "".padEnd(debugWidth, '-') + '> '
    : (prefix + ' ').padEnd(debugWidth, '-') + '> ';
  addDebug(object, enabled, preline, color);
  object.debugData = DataDebugger(enabled, preline, color);
}

/**
 * @ignore
 * Function to generate a debugData() method for the above.
 */
function DataDebugger(enabled, prefix, color, length=debugWidth) {
  return enabled
    ? (message, data={}) => {
        console.log(
          '%s' + prefix + '%s' + message,
          color ? ANSIescape(color) : '',
          color ? ANSIreset() : ''
        );
        Object.entries(data).map(
          ([key, value]) => console.log(
            '%s' + key.padStart(length, ' ') + ':%s',
            color ? ANSIescape(color) : '',
            color ? ANSIreset() : '',
            value
          )
        )
      }
    : doNothing;
}
