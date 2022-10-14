import test from 'ava';
import Queries from '../../src/Queries.js'
import { mockDatabase } from '../library/database.js';

const spec = {
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
const queries1 = new Queries(mockDatabase, spec);

test(
  'query("one")',
  t => t.is(
    queries1.sql('one'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE one=1'
  )
);

test(
  'query("SELECT a FROM <table>")',
  t => t.is(
    queries1.sql('SELECT a FROM <table>'),
    'SELECT a FROM badgers'
  )
);

test(
  'query("eleven")',
  t => {
    const error = t.throws( () => queries1.sql('eleven') );
    t.is( error.message, "Invalid named query specified: eleven" )
  }
);

const queries2 = new Queries(mockDatabase, spec);

test(
  'query("two")',
  t => t.is(
    queries2.sql('two'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE two=2'
  )
);
