import { createDatabase, databaseConfig } from "./database.js";

export const usersConfig = {
  table: 'user',
  columns: [
    'id', 'forename', 'surname', 'email', 'password', 'is_admin',
  ],
  virtualColumns: {
    // name: "CONCAT(user.forename, ' ', user.surname)"
    name: "user.forename || ' ' || user.surname"
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
      include: 'name is_admin'
    },
    // explicitly include and exclude columns
    public: {
      include: 'name',
      exclude: 'password is_admin'
    },
  }
};

export const database = createDatabase({
  ...databaseConfig,
  tables: {
    users: usersConfig,
  }
});

export const createUsers = async database => {
  await database.raw("CREATE TABLE user (id INTEGER PRIMARY KEY ASC, forename TEXT, surname TEXT, email TEXT, password TEXT, is_admin INTEGER)");
  const users = database.table('users');

  await users.insert({
    forename: 'Bobby',
    surname: 'Badger',
    email: 'bobby@badger.com',
    is_admin: 1,
  });
  await users.insert({
    forename: 'Brian',
    surname: 'Badger',
    email: 'brian@badger.com',
    is_admin: 0,
  });
  await users.insert({
    forename: 'Simon',
    surname: 'Stoat',
    email: 'simon@stoat.com',
  });
}
