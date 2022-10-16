import test from 'ava';
import { notImplemented, notImplementedInBaseClass, notImplementedInModule } from '../../src/Utils/Error.js';

test( 'notImplemented()',
  t => {
    const error = t.throws( () => notImplemented('antigravity()', 'this Universe') );
    t.is( error.message, "antigravity() is not implemented in this Universe" )
  }
)

test( 'notImplementedInModule()',
  t => {
    const notInThisUniverse = notImplementedInModule('this Universe');
    const error = t.throws( () => notInThisUniverse('antigravity()') );
    t.is( error.message, "antigravity() is not implemented in this Universe" )
  }
)

test( 'notImplementedInBaseClass()',
  t => {
    const notInThisUniverse = notImplementedInBaseClass('Universe');
    const error = t.throws( () => notInThisUniverse('antigravity()') );
    t.is( error.message, "antigravity() is not implemented in the Universe base class" )
  }
)

