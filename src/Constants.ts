import { splitHash } from '@abw/badger-utils'

export const defaultIdColumn  = 'id'
export const bitSplitter      = /:/
export const singleWord       = /^\w+$/
export const allColumns       = '*'
export const whereTrue        = 'true'
export const unknown          = 'unknown'
export const space            = ' '
export const equals           = '='
export const comma            = ', '
export const newline          = "\n"
export const blank            = ''
export const singleQuote      = "'"
export const doubleQuote      = '"'
export const backtick         = '`'
export const lparen           = '('
export const rparen           = ')'
export const WITH             = 'WITH'
export const INSERT           = 'INSERT'
export const SELECT           = 'SELECT'
export const UPDATE           = 'UPDATE'
export const DELETE           = 'DELETE'
export const FROM             = 'FROM'
export const IN               = 'IN'
export const NOT_IN           = 'NOT IN'
export const INTO             = 'INTO'
export const SET              = 'SET'
export const VALUES           = 'VALUES'
export const JOIN             = 'JOIN'
export const LEFT_JOIN        = 'LEFT JOIN'
export const RIGHT_JOIN       = 'RIGHT JOIN'
export const INNER_JOIN       = 'INNER JOIN'
export const FULL_JOIN        = 'FULL JOIN'
export const WHERE            = 'WHERE'
export const GROUP_BY         = 'GROUP BY'
export const ORDER_BY         = 'ORDER BY'
export const HAVING           = 'HAVING'
export const LIMIT            = 'LIMIT'
export const OFFSET           = 'OFFSET'
export const RETURNING        = 'RETURNING'
export const AS               = 'AS'
export const ON               = 'ON'
export const AND              = 'AND'
export const ASC              = 'ASC'
export const DESC             = 'DESC'
export const BEGIN            = 'BEGIN'
export const ROLLBACK         = 'ROLLBACK'
export const COMMIT           = 'COMMIT'

export const MATCH_DATABASE_URL = /^(\w+):\/\/(?:(?:(\w+)(?::(\w+))?@)?(\w+)(?::(\d+))?\/)?(\w+)/;

export const MATCH_DATABASE_ELEMENTS = {
  engine:   1,
  user:     2,
  password: 3,
  host:     4,
  port:     5,
  database: 6,
};

export const DATABASE_CONNECTION_ALIASES = {
  username: 'user',
  pass:     'password',
  hostname: 'host',
  file:     'filename',
  name:     'database',
};

export const VALID_CONNECTION_KEYS = splitHash(
  // TODO: rename connectionString to url/uri?
  'engine user password host port database filename connectionString'
)

export const VALID_CONNECTION_ALIASES = splitHash(
  'username pass hostname file name'
)

export const VALID_TABLE_COLUMN_KEYS = splitHash(
  'id readonly required fixed key type column tableColumn'
)

export const MATCH_VALID_FRAGMENT_KEY = /^(id|readonly|required|fixed|key|(type|column)=.*)/

