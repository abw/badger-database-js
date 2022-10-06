import test from 'ava';
import { debug, setDebug, getDebug } from '../../src/Utils/Debug.js';

test.serial(
  'inital debugging state',
  t => {
    const test = debug.test;
    t.is( test.debug, false );
    t.is( test.prefix, 'Test' );
  }
)

test.serial(
  'change debugging state',
  t => {
    const test = debug.test;
    t.is( test.debug, false );
    t.is( test.prefix, 'Test' );
    setDebug({ test: true });
    t.is( test.debug, true );
    t.is( test.prefix, 'Test' );
  }
)

test.serial(
  'set debugging options',
  t => {
    const test = debug.test;
    t.is( test.debug, true );
    t.is( test.prefix, 'Test' );
    setDebug({ test: { prefix: 'Testing123' } });
    t.is( test.debug, true );
    t.is( test.prefix, 'Testing123' );
  }
)

test.serial(
  'get debugging options',
  t => {
    const test = debug.test;
    t.is( test.debug, true );
    t.is( test.prefix, 'Testing123' );
    const dbg = getDebug('test', { debug: false }, { prefix: 'Testola' });
    t.is( test.debug, true );
    t.is( test.prefix, 'Testing123' );
    t.is( dbg.debug, false );
    t.is( dbg.prefix, 'Testola' );
  }
)