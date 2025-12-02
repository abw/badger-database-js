import { expect, test } from 'vitest'
import { debug, setDebug, getDebug } from '../../src/Utils/Debug'

test( 'inital debugging state',
  () => {
    const test = debug.test;
    expect(test.debug).toBe(false)
    expect(test.prefix).toBe('Test')
  }
)

test( 'change debugging state',
  () => {
    const test = debug.test;
    expect(test.debug).toBe(false)
    expect(test.prefix).toBe('Test')
    setDebug({ test: true });
    expect(test.debug).toBe(true)
    expect(test.prefix).toBe('Test')
  }
)

test( 'set debugging options',
  () => {
    const test = debug.test;
    expect(test.debug).toBe(true)
    expect(test.prefix).toBe('Test')
    setDebug({ test: { prefix: 'Testing123' } });
    expect(test.debug).toBe(true)
    expect(test.prefix).toBe('Testing123')
  }
)

test( 'get debugging options',
  () => {
    const test = debug.test;
    expect(test.debug).toBe(true)
    expect(test.prefix).toBe('Testing123')
    const dbg = getDebug('test', { debug: false }, { prefix: 'Testola' });
    expect(test.debug).toBe(true)
    expect(test.prefix).toBe('Testing123')
    expect(dbg.debug).toBe(false)
    expect(dbg.prefix).toBe('Testola')
  }
)