import test from 'ava';
import Engine from '../../src/Engine.js'

test(
  'connect()',
  async t => {
    const engine = new Engine();
    const error = await t.throwsAsync( () => engine.connect() );
    t.is( error.message, "connect() is not implemented in the Engine base class" )
  }
)

test(
  'connected()',
  async t => {
    const engine = new Engine();
    const error = await t.throwsAsync( () => engine.connected() );
    t.is( error.message, "connected() is not implemented in the Engine base class" )
  }
)

test(
  'disconnect()',
  async t => {
    const engine = new Engine();
    const error = await t.throwsAsync( () => engine.disconnect() );
    t.is( error.message, "disconnect() is not implemented in the Engine base class" )
  }
)
