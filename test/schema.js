import test from 'ava';
import Schema from '../src/Schema.js'

const spec = {
  debug: false,
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
}
const schema = new Schema(spec);
//console.log('spec: ', spec);
//console.log('schema: ', schema);


test(
  'table schema',
  t => t.is( schema.table, 'user' )
);

test(
  'schems columns',
  t => t.deepEqual(
    schema.columnNames,
    ['id', 'forename', 'surname', 'password', 'email', 'registered', 'last_login', 'is_admin']
  )
);

test(
  'table columns',
  t => t.is(
    schema.tableColumns.id,
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
    t.is(c[0], "CONCAT(user.forename, ' ', user.surname)");
    t.is(c[1], "name");
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
    [["CONCAT(user.forename, ' ', user.surname)", 'name']]
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
      ["CONCAT(user.forename, ' ', user.surname)",'name'],
      'user.registered'
    ]
  )
);

