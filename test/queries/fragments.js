import test from 'ava';
import { expandFragments } from '../../src/Utils/Queries.js';

const fragments = {
  table: 'badgers',
  someColumns: 'a, b, c',
  moreColumns: 'd, e, f',
  allColumns: '<someColumns>, <moreColumns>',
  select: 'SELECT <allColumns> FROM <table>',
  loopA: 'loopA then <loopB>',
  loopB: 'loopB then <loopA>',
}

test(
  'expand query',
  t => t.is(
    expandFragments('<select> WHERE a=10', fragments),
    'SELECT a, b, c, d, e, f FROM badgers WHERE a=10'
  )
);

test(
  'expand query with typo throws an error',
  t => {
    const error = t.throws( () => expandFragments('<seletc> WHERE a=10', fragments) );
    t.is( error.message, "Invalid fragment in SQL expansion: <seletc>" )
  }
);

test(
  'expand query with runaway throws an error',
  t => {
    const error = t.throws( () => expandFragments('<loopA>', fragments) );
    t.is( error.message, "Maximum SQL expansion limit (maxDepth=16) exceeded: loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB" )
  }
);

test(
  'expand query with runaway throws an error more soonly',
  t => {
    const error = t.throws( () => expandFragments('<loopA>', fragments, 5) );
    t.is( error.message, "Maximum SQL expansion limit (maxDepth=5) exceeded: loopA -> loopB -> loopA -> loopB -> loopA" )
  }
);
