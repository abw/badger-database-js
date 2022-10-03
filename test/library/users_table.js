const serialTypeFragment = engine =>
  engine === 'sqlite'
    ? 'INTEGER PRIMARY KEY ASC'
    : 'SERIAL'

export const createUsersTableQuery = engine => {
  const serial = serialTypeFragment(engine);
  return `
    CREATE TABLE users (
      id      ${serial},
      name    TEXT,
      email   TEXT,
      friends INTEGER DEFAULT 0
    )`
}

export const createUsersIdTableQuery = engine => {
  const serial = serialTypeFragment(engine);
  return `
    CREATE TABLE users (
      user_id ${serial},
      name    TEXT,
      email   TEXT
    )`
}
