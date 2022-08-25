import test from 'ava';
import Table from '../../src/Table.js'

class MockDatabase {
  raw(...args) {
    return "[RAW:" + args.join(':') + "]";
  }
}
const db = new MockDatabase();

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
  db,
  usersSchema
);

test(
  'table schema',
  t => t.is( table.table, 'user' )
);

test(
  'schema columns',
  t => t.deepEqual(
    table.columnNames,
    ['id', 'forename', 'surname', 'password', 'email', 'registered', 'last_login', 'is_admin']
  )
);

test(
  'table columns',
  t => t.is(
    table.tableColumns.id,
    'user.id'
  )
);

test(
  'column set include string',
  t => t.deepEqual(
    table.columnSets.basic,
    [ 'forename', 'surname', 'name', 'email' ],
  )
);

test(
  'column set explicit exclude',
  t => t.deepEqual(
    table.columnSets.default,
    [ 'id', 'forename', 'surname', 'email', 'registered', 'last_login' ],
  )
);

test(
  'column set explicit include',
  t => t.deepEqual(
    table.columnSets.admin,
    [ 'id', 'forename', 'surname', 'password', 'email', 'registered', 'last_login', 'is_admin', 'name' ],
  )
);

test(
  'column set explicit include and exclude',
  t => t.deepEqual(
    table.columnSets.public,
    [ 'id', 'forename', 'surname', 'email', 'registered', 'last_login', 'name' ],
  )
);

test(
  'table.column(id) - real column',
  t => t.is(
    table.column('id'),
    'user.id'
  )
);

test(
  'table.column(name) - virtual column',
  t => {
    const c = table.column('name');
    t.is(c, "[RAW:CONCAT(user.forename, ' ', user.surname) as name]");
  }
);

test(
  'table.columns(id) - real column',
  t => t.deepEqual(
    table.columns('id'),
    ['user.id']
  )
);

test(
  'table.columns(id, forename, surname) - real column',
  t => t.deepEqual(
    table.columns('id forename surname'),
    ['user.id', 'user.forename', 'user.surname']
  )
);

test(
  'table.columns(name) - virtual column',
  t => t.deepEqual(
    table.columns('name'),
    ["[RAW:CONCAT(user.forename, ' ', user.surname) as name]"]
  )
);

test(
  'table.columns() - implicit default columns',
  t => t.deepEqual(
    table.columns(),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login' ],
  )
);

test(
  'table.columns(@default) - explicitly named default columns',
  t => t.deepEqual(
    table.columns('@default'),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login' ],
  )
);

test(
  'table.columns(@public registered) - column set and column',
  t => t.deepEqual(
    table.columns('@public registered'),
    [ 'user.id', 'user.forename', 'user.surname', 'user.email', 'user.registered', 'user.last_login',
      "[RAW:CONCAT(user.forename, ' ', user.surname) as name]",
      'user.registered'
    ]
  )
);

