import test from 'ava';
import Queries, { queries } from '../../src/Queries.js'

const spec = {
  debug: false,
  debugPrefix: '    Queries > ',
  debugColor: 'red',
  queries: {
    one: '<select> WHERE one=1',
    two: '<select> WHERE two=2',
  },
  fragments: {
    table: 'badgers',
    someColumns: 'a, b, c',
    moreColumns: 'd, e, f',
    allColumns: '<someColumns>, <moreColumns>',
    select: 'SELECT <allColumns> FROM <table>',
  }
}
const queries1 = new Queries(spec);

test(
  'query("one")',
  t => t.is(
    queries1.query('one'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE one=1'
  )
);

test(
  'query("SELECT a FROM <table>")',
  t => t.is(
    queries1.query('SELECT a FROM <table>'),
    'SELECT a FROM badgers'
  )
);

test(
  'query("eleven")',
  t => {
    const error = t.throws( () => queries1.query('eleven') );
    t.is( error.message, "Invalid query specified: eleven" )
  }
);

const queries2 = queries(spec);

test(
  'query("two")',
  t => t.is(
    queries2.query('two'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE two=2'
  )
);
