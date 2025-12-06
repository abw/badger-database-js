import { ANSIescape, ANSIreset } from './Color'
import { doNothing, fail, isBoolean, isObject } from '@abw/badger-utils'

export function Debugger(
  enabled: boolean,
  prefix='',
  color: string     // TODO
) {
  return enabled
    ? prefix
      ? (format: string, ...args: any[]) =>
          console.log(
            '%s' + prefix + '%s' + format,
            color ? ANSIescape(color) : '',
            ANSIreset(),
            ...args,
          )
      : console.log.bind(console)
    : doNothing;
}

export function addDebug(
  obj: object,
  enabled: boolean,
  prefix='',
  color?: string
) {
  Object.assign(
    obj,
    { debug: Debugger(enabled, prefix, color) }
  )
}

/**
 * @ignore
 * Default width for debugging prefix column.
 */
const debugWidth = 16;

/**
 * @ignore
 * Default debugging options
 */
export type DebugSetting = {
  debug?: boolean
  prefix?: string
  color?: string
  debugPrefix?: string
  debugColor?: string
}

export type DebugComponent =
  'database' | 'engine' | 'query' | 'tables' | 'table' | 'record' |
  'builder' | 'transaction' | 'test'

export let debug: Record<DebugComponent, DebugSetting> = {
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
  query: {
    debug:  false,
    prefix: 'Query',
    color:  'cyan',
  },
  tables: {
    debug:  false,
    prefix: 'Tables',
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
  transaction: {
    debug:  false,
    prefix: 'Transaction',
    color:  'bright red'
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
const invalidDebugItem = (item: string) =>
  fail(`Invalid debug item "${item}" specified`)

export type DebugOption = boolean | Partial<DebugSetting>

/**
 * Function to set debugging options.  Each key in the `options` should be
 * one of the components that supports debugging: `database`, `engine`,
 * `queries`, etc.  The corresponding values should either be boolean values
 * to enable or disable debugging for the option, or an object containing a
 * `debug` flag, and optionally, a `prefix` and/or `color`.
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
export const setDebug = (
  options: Partial<Record<DebugComponent, DebugOption>>
) => {
  Object.entries(options).map(
    ([key, value]) => {
      const set = debug[key] || invalidDebugItem(key)
      if (isBoolean(value)) {
        set.debug = value
      }
      else if (isObject(value)) {
        Object.assign(set, value)
      }
    }
  )
}

/**
 * Function to get debugging options for one of the components that supports
 * debugging: `database`, `engine`, `queries`, `table`, etc. One or more
 * additional objects can be passed that contain further configuration
 * options. The returned object will contained a merged set of the defaults
 * and those options.
 * @example
 * getDebug('engine')
 * @example
 * getDebug('engine', { debug: true })
 * @example
 * getDebug('engine', { debug: true, color: 'green' })
 * @example
 * getDebug('engine', { debug: true }, { color: 'green' })
 */
export const getDebug = (
  name: DebugComponent,
  ...configs: Partial<DebugSetting>[]
): DebugSetting => {
  const defaults = debug[name] || invalidDebugItem(name);
  return Object.assign(
    {},
    defaults,
    ...configs
  );
}

/**
 * Function to add the `debug()` and `debugData()` methods to an object.
 * The `name` should be the name of a debug component, e.g. `database`,
 * `engine`, `queries`, `table`, etc.  One or more additional objects can
 * be passed that contain further configuration options.
 * @example
 * addDebugMethod(myObject, 'engine', { debug: true })
 * @example
 * getDebug(myObject, 'engine', { debug: true }, { color: 'green' })
 */
export const addDebugMethod = (
  object: object,
  name: DebugComponent,
  ...configs: DebugSetting[]
) => {
  const options = getDebug(name, ...configs);
  const enabled = options.debug;
  const prefix  = options.debugPrefix || options.prefix;
  const color   = options.debugColor  || options.color;
  const preline = prefix.length > debugWidth - 2
    ? prefix + "\n" + "".padEnd(debugWidth, '-') + '> '
    : (prefix + ' ').padEnd(debugWidth, '-') + '> ';
  addDebug(object, enabled, preline, color);
  Object.assign(object, { debugData: DataDebugger(enabled, preline, color) })
}

/**
 * @ignore
 * Function to generate a debugData() method for the above.
 */
function DataDebugger(
  enabled: boolean,
  prefix: string,
  color: string,
  length:number = debugWidth
) {
  return enabled
    ? (message: string, data={}) => {
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
