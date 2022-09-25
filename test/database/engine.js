import test from 'ava';
import Engine from '../../src/Engine.js'
import Drivers from '../../src/Drivers.js'

test(
  'new sqlite engine',
  async t => {
    const driver = await Drivers.sqlite({ filename: ':memory:' });
    const engine = new Engine(driver);
    // console.log('engine: ', engine);
    t.is( engine instanceof Engine, true )
  }
)
