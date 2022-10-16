import test from 'ava';
import { connect } from '../../src/Database.js';

const db = connect({
  database: 'sqlite:memory',
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
});

test( 'query("one")',
  t => t.is(
    db.sql('one'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE one=1'
  )
);

test( 'query("SELECT a FROM <table>")',
  t => t.is(
    db.sql('SELECT a FROM <table>'),
    'SELECT a FROM badgers'
  )
);

test( 'query("eleven")',
  t => {
    const error = t.throws( () => db.sql('eleven') );
    t.is( error.message, "Invalid named query specified: eleven" )
  }
);

test( 'query("two")',
  t => t.is(
    db.sql('two'),
    'SELECT a, b, c, d, e, f FROM badgers WHERE two=2'
  )
);
