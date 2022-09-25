import test from 'ava';
import Driver from '../../src/Driver.js'

test(
  'connect()',
  async t => {
    const driver = new Driver();
    const error = await t.throwsAsync( () => driver.connect() );
    t.is( error.message, "connect() is not implemented in the Driver base class" )
  }
)

test(
  'connected()',
  async t => {
    const driver = new Driver();
    const error = await t.throwsAsync( () => driver.connected() );
    t.is( error.message, "connected() is not implemented in the Driver base class" )
  }
)

test(
  'disconnect()',
  async t => {
    const driver = new Driver();
    const error = await t.throwsAsync( () => driver.disconnect() );
    t.is( error.message, "disconnect() is not implemented in the Driver base class" )
  }
)
