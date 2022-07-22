import test from 'ava';
import Queries from '../src/Queries.js'

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
  }
}
const queries = new Queries(spec);

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
