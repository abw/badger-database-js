export const serialTypeFragment = engine =>
  engine === 'sqlite'
    ? 'INTEGER PRIMARY KEY ASC'
    : 'SERIAL'

export const dropUsersTableQuery =
  `DROP TABLE IF EXISTS users`

export const createUsersTableQuery = (engine, name="users") => {
  const serial = serialTypeFragment(engine);
  return `
    CREATE TABLE ${name} (
      id      ${serial},
      name    TEXT,
      email   TEXT,
      animal  TEXT,
      friends INTEGER DEFAULT 0
    )`
}

export const createUsersIdTableQuery = engine => {
  const serial = serialTypeFragment(engine);
  return `
    CREATE TABLE users (
      user_id ${serial},
      name    TEXT,
      animal  TEXT,
      email   TEXT
    )`
}
