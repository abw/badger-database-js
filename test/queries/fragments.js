import test from 'ava';
import Queries from '../../src/Queries.js'

const spec = {
  debug: false,
  debugPrefix: '    Queries > ',
  debugColor: 'red',
  fragments: {
    table: 'badgers',
    someColumns: 'a, b, c',
    moreColumns: 'd, e, f',
    allColumns: '<someColumns>, <moreColumns>',
    select: 'SELECT <allColumns> FROM <table>',
    loopA: 'loopA then <loopB>',
    loopB: 'loopB then <loopA>',
  }
}
const queries = new Queries('MockEngine', spec);

test(
  'expand query',
  t => t.is(
    queries.expandFragments('<select> WHERE a=10'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE a=10'
  )
);

test(
  'expand query with typo throws an error',
  t => {
    const error = t.throws( () => queries.expandFragments('<seletc> WHERE a=10') );
    t.is( error.message, "Invalid fragment in SQL expansion: <seletc>" )
  }
);

test(
  'expand query with runaway throws an error',
  t => {
    const error = t.throws( () => queries.expandFragments('<loopA>') );
    t.is( error.message, "Maximum SQL expansion limit (maxExpansion=16) exceeded: loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB -> loopA -> loopB" )
  }
);

const queries2 = new Queries('MockEngine', { ...spec, maxExpansion: 5 });
test(
  'expand query with runaway throws an error more soonly',
  t => {
    const error = t.throws( () => queries2.expandFragments('<loopA>') );
    t.is( error.message, "Maximum SQL expansion limit (maxExpansion=5) exceeded: loopA -> loopB -> loopA -> loopB -> loopA" )
  }
);
