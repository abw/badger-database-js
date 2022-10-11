test.serial(
  'create users',
  async t => {
    await db.run(`
      CREATE TABLE users (
        id      INTEGER PRIMARY KEY ASC,
        name    TEXT,
        email   TEXT
      )
    `);
    t.pass();
  }
)

test.serial(
  'insert a user',
  async t => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Bobby Badger', 'bobby@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is( result.changes, 1 );
  }
)

test.serial(
  'insert another user',
  async t => {
    const result = await db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Brian Badger', 'brian@badgerpower.com'],
      { sanitizeResult: true }
    );
    t.is( result.changes, 1 );
  }
)

