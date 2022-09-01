import test from 'ava';
import Table from '../../src/Table.js'
import { mockDatabase } from '../library/database.js';

const usersSchema = {
  table: 'user',
  columns: [
    'id', 'forename', 'surname', 'password',
    'email', 'registered', 'last_login', 'is_admin'
  ],
  virtualColumns: {
    name: "CONCAT(user.forename, ' ', user.surname)"
  },
  columnSets: {
    // string based subset of columns
    basic: 'forename surname name email',
    // explicitly exclude columns
    default: {
      exclude: 'password is_admin'
    },
    // explicitly include virtual column
    admin: {
      include: 'name'
    },
    // explicitly include and exclude columns
    public: {
      include: 'name',
      exclude: 'password is_admin'
    },
  }
};

const table = new Table(
  mockDatabase,
  usersSchema
);
const schema = table.schema;

test(
  'schema table',
  t => t.is( schema.table, 'user' )
);

/*
test(
  'schema columns',
  t => t.deepEqual(
    schema.columnNames,
    ['id', 'forename', 'surname', 'password', 'email', 'registered', 'last_login', 'is_admin']
  )
);
*/

test(
  'schema columnIndex',
  t => t.is(
    schema.columnIndex.id.tableColumn,
    'user.id'
  )
);

test(
  'column set include string',
  t => t.deepEqual(
    schema.columnSets.basic,
    [ 'forename', 'surname', 'name', 'email' ],
  )
);

test(
  'column set explicit exclude',
  t => t.deepEqual(
    schema.columnSets.default,
    [ 'id', 'forename', 'surname', 'email', 'registered', 'last_login' ],
  )
);

test(
  'column set explicit include',
  t => t.deepEqual(
    schema.columnSets.admin,
    [ 'id', 'forename', 'surname', 'password', 'email', 'registered', 'last_login', 'is_admin', 'name' ],
  )
);

test(
  'column set explicit include and exclude',
  t => t.deepEqual(
    schema.columnSets.public,
    [ 'id', 'forename', 'surname', 'email', 'registered', 'last_login', 'name' ],
  )
);

test(
  'schema.column(id) - real column',
  t => t.is(
    schema.column('id'),
    'user.id'
  )
);

test(
  'schema.column(name) - virtual column',
  t => {
    const c = schema.column('name');
    t.is(c, "[RAW:CONCAT(user.forename, ' ', user.surname) as name]");
  }
);

test(
  'schema.columns(id) - real column',
  t => t.deepEqual(
    schema.columns('id'),
    ['user.id']
  )
);

test(
  'schema.columns(id, forename, surname) - real column',
  t => t.deepEqual(
    schema.columns('id forename surname'),
    ['user.id', 'user.forename', 'user.surname']
  )
);

test(
  'schema.columns(name) - virtual column',
  t => t.deepEqual(
    schema.columns('name'),
    ["[RAW:CONCAT(user.forename, ' ', user.surname) as name]"]
  )
);

test(
  'schema.columns() - implicit default columns',
  t => t.deepEqual(
    schema.columns(),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login' ],
  )
);

test(
  'schema.columns(@default) - explicitly named default columns',
  t => t.deepEqual(
    schema.columns('@default'),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login' ],
  )
);

test(
  'schema.columns(@public registered) - column set and column',
  t => t.deepEqual(
    schema.columns('@public registered'),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login',
      "[RAW:CONCAT(user.forename, ' ', user.surname) as name]",
      'user.registered'
    ]
  )
);
