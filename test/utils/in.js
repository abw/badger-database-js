import test from 'ava';
import { isIn } from '../../src/Utils/index.js';
import { IN, NOT_IN } from '../../src/Constants.js';

test( 'isIn("in")', t => t.is( isIn("in"), IN ) )
test( 'isIn("IN")', t => t.is( isIn("in"), IN ) )
test( 'isIn("In")', t => t.is( isIn("in"), IN ) )
test( 'isIn("not in")', t => t.is( isIn("not in"), NOT_IN ) )
test( 'isIn("nOt    iN")', t => t.is( isIn("nOt    iN"), NOT_IN ) )
