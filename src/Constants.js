// engine parameters
export const databaseStringRegex = /^(\w+):\/\/(?:(?:(\w+)(?::(\w+))?@)?(\w+)(?::(\d+))?\/)?(\w+)/;
export const databaseStringElements = {
  engine:   1,
  user:     2,
  password: 3,
  host:     4,
  port:     5,
  database: 6,
};
export const databaseAliases = {
  username: 'user',
  pass:     'password',
  hostname: 'host',
  file:     'filename',
};

// table column configuration/validation
export const defaultIdColumn = 'id';
export const bitSplitter = /:/;
export const allColumns = '*';
export const whereTrue = 'true';
