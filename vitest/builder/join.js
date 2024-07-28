import { expect, test } from 'vitest'
import Join from '../../src/Builder/Join.js'
import { connect } from '../../src/Database.js'
import { QueryBuilderError } from '../../src/Utils/Error.js'
import { expectOpTypeSql, expectToThrowErrorTypeMessage } from '../library/expect.js';

let db;

test( 'connect',
  () => {
    db = connect({ database: 'sqlite:memory' })
    expect(db.engine.engine).toBe('sqlite')
  }
)

test( 'join object',
  () => expectOpTypeSql(
    db.build.join({ table: 'a', from: 'b', to: 'c' }),
    Join,
    'JOIN "a" ON "b" = "a"."c"'
  )
)

test( 'join object with combined to',
  () => expectOpTypeSql(
    db.build.join({ from: 'a.b', to: 'c.d' }),
    Join,
    'JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join object with combined to and type',
  () => expectOpTypeSql(
    db.build.join({ from: 'a.b', to: 'c.d', type: 'inner' }),
    Join,
    'INNER JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join string',
  () => expectOpTypeSql(
    db.build.join("b=a.c"),
    Join,
    'JOIN "a" ON "b" = "a"."c"'
  )
)

test( 'join string with spaces',
  () => expectOpTypeSql(
    db.build.join("b = a.c"),
    Join,
    'JOIN "a" ON "b" = "a"."c"'
  )
)

test( 'join string with table name',
  () => expectOpTypeSql(
    db.build.join("a.b=c.d"),
    Join,
    'JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join string with table name and spaces',
  () => expectOpTypeSql(
    db.build.join("a.b = c.d"),
    Join,
    'JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'left join string',
  () => expectOpTypeSql(
    db.build.join("a<=b.c"),
    Join,
    'LEFT JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'left join string with spaces',
  () => expectOpTypeSql(
    db.build.join("a <= b.c"),
    Join,
    'LEFT JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'left join string with table name',
  () => expectOpTypeSql(
    db.build.join("a.b<=c.d"),
    Join,
    'LEFT JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'left join string with table name and spaces',
  () => expectOpTypeSql(
    db.build.join("a.b <= c.d"),
    Join,
    'LEFT JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'right join string',
  () => expectOpTypeSql(
    db.build.join("a=>b.c"),
    Join,
    'RIGHT JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'right join string with spaces',
  () => expectOpTypeSql(
    db.build.join("a => b.c"),
    Join,
    'RIGHT JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'right join string with table name',
  () => expectOpTypeSql(
    db.build.join("a.b=>c.d"),
    Join,
    'RIGHT JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'right join string with table name and spaces',
  () => expectOpTypeSql(
    db.build.join("a.b => c.d"),
    Join,
    'RIGHT JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'full join string',
  () => expectOpTypeSql(
    db.build.join("a<=>b.c"),
    Join,
    'FULL JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'full join string with spaces',
  () => expectOpTypeSql(
    db.build.join("a <=> b.c"),
    Join,
    'FULL JOIN "b" ON "a" = "b"."c"'
  )
)

test( 'full join string with table name',
  () => expectOpTypeSql(
    db.build.join("a.b<=>c.d"),
    Join,
    'FULL JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'full join string with table name and spaces',
  () => expectOpTypeSql(
    db.build.join("a.b <=> c.d"),
    Join,
    'FULL JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join array with four elements',
  () => expectOpTypeSql(
    db.build.join(['left', 'a.b', 'c', 'd']),
    Join,
    'LEFT JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join array with three elements',
  () => expectOpTypeSql(
    db.build.join(['a.b', 'c', 'd']),
    Join,
    'JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'join array with two elements',
  () => expectOpTypeSql(
    db.build.join(['a.b', 'c.d']),
    Join,
    'JOIN "c" ON "a"."b" = "c"."d"'
  )
)

test( 'multiple joins',
  () => expectOpTypeSql(
    db.build.join('users.id=employees.user_id', 'employees.company_id=companies.id'),
    Join,
    'JOIN "employees" ON "users"."id" = "employees"."user_id"\nJOIN "companies" ON "employees"."company_id" = "companies"."id"'
  )
)

test( 'invalid join type',
  () => expectToThrowErrorTypeMessage(
    () => db.build.join({ type: 'wibble', table: 'a', from: 'b', to: 'c' }).sql(),
    QueryBuilderError,
    'Invalid join type "wibble" specified for query builder "join" component.  Valid types are "left", "right", "inner" and "full".'
  )
)

test( 'invalid join object',
  () => expectToThrowErrorTypeMessage(
    () => db.build.join({ talbe: 'a', from: 'b', to: 'c' }).sql(),
    QueryBuilderError,
    'Invalid object with "from, talbe, to" properties specified for query builder "join" component.  Valid properties are "type", "table", "from" and "to".',
  )
)

test( 'invalid join string',
  () => expectToThrowErrorTypeMessage(
    () => db.build.join('wibble=wobble').sql(),
    QueryBuilderError,
    'Invalid join string "wibble=wobble" specified for query builder "join" component.  Expected "from=table.to".',
  )
)

test( 'invalid join array',
  () => expectToThrowErrorTypeMessage(
    () => db.build.join(['wibble', 'wobble']).sql(),
    QueryBuilderError,
    'Invalid array with 2 items specified for query builder "join" component. Expected [type, from, table, to], [from, table, to] or [from, table.to].',
  )
)

test( 'generateSQL() with single value',
  () => expect(
    Join.generateSQL('JOIN a')
  ).toBe(
    'JOIN a'
  )
)

test( 'generateSQL() with multiple values',
  () => expect(
    Join.generateSQL(['JOIN a', 'JOIN b']),
  ).toBe(
    'JOIN a\nJOIN b'
  )
)

test( 'disconnect',
  () => db.disconnect()
)
