import test from 'ava';
import Drivers from '../../src/Drivers.js'
import Sqlite from '../../src/Driver/Sqlite/index.js'

test(
  'acquire()',
  async t => {
    const driver = await Drivers.sqlite({ filename: ':memory:' })
    console.log('sqlite driver: ', driver);
    t.is( driver instanceof Sqlite, true )
  }
)
