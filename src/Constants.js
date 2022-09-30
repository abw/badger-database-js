// engine parameters
export const engineStringRegex = /^(\w+):\/\/(?:(?:(\w+)(?::(\w+))?@)?(\w+)(?::(\d+))?\/)?(\w+)/;
export const engineStringElements = {
  driver:   1,
  user:     2,
  password: 3,
  host:     4,
  port:     5,
  database: 6,
};
export const engineAliases = {
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
