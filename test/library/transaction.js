import test from 'ava';
import { connect } from "../../src/index.js";
import { databaseConfig } from './database.js';
import { setDebug } from '../../src/Utils/Debug.js';

setDebug({
  // engine: true,
  // transaction: true,
})
// test.todo( 'transaction support is a work in progress ');

export const runTransactionTests = async (engine) => {
  const database = databaseConfig(engine);
  const sqlite   = engine === 'sqlite';
  // const mysql    = engine === 'mysql';
  const postgres = engine === 'postgres';
  const ph1      = postgres ? '$1' : '?';
  const ph2      = postgres ? '$2' : '?';
  const serial   = sqlite ? 'INTEGER PRIMARY KEY ASC'  : 'SERIAL';
  const queries  = {
    dropAnimalsTable:   'DROP TABLE IF EXISTS animals',
    createAnimalsTable: `
      CREATE TABLE animals (
        id        ${serial},
        name      TEXT,
        skill     TEXT
        ${sqlite ? '' : ', PRIMARY KEY (id)'}
    )`,
    insertAnimal: `
      INSERT INTO animals (name, skill) VALUES (${ph1}, ${ph2})
    `,
    fetchAnimals: `
      SELECT name, skill FROM animals
    `,
    deleteAnimals: `
      DELETE FROM animals
    `
  };

  test.serial('hello',
    t => t.pass()
  );

  const tables = {
    animals: {
      columns: 'id name skill',
    },
  };

  const db = connect({
    database, tables, queries
  });

  const animals = await db.table('animals');
  // let Bobby, Brian, Franky, Fiona;

  test.serial( 'drop/create table',
    async t => {
      await db.run('dropAnimalsTable');
      await db.run('createAnimalsTable');
      t.pass();
    }
  )

  test.serial( 'transaction with rollback',
    async t => {
      await db.transaction(
        async (db, commit, rollback) => {
          // console.log('running transaction code');
          await db.run('insertAnimal', ['Badger', 'Foraging']);
          await db.run('insertAnimal', ['Ferret', 'Ferreting']);
          const animals = await db.all('fetchAnimals');
          t.deepEqual(
            animals,
            [
              { name: 'Badger', skill: 'Foraging' },
              { name: 'Ferret', skill: 'Ferreting' },
            ]
          )
          await rollback();
        }
      );
      const committed = await db.all('fetchAnimals')
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'transaction with autoRollback',
    async t => {
      await db.transaction(
        async db => {
          await db.run('insertAnimal', ['Badger', 'Foraging']);
          await db.run('insertAnimal', ['Ferret', 'Ferreting']);
          const animals = await db.all('fetchAnimals');
          t.deepEqual(
            animals,
            [
              { name: 'Badger', skill: 'Foraging' },
              { name: 'Ferret', skill: 'Ferreting' },
            ]
          )
        },
        { autoRollback: true }
      );
      const committed = await db.all('fetchAnimals')
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'transaction with commit',
    async t => {
      await db.transaction(
        async (db, commit) => {
          await db.run('insertAnimal', ['Badger', 'Foraging']);
          await db.run('insertAnimal', ['Ferret', 'Ferreting']);
          const animals = await db.all('fetchAnimals');
          t.deepEqual(
            animals,
            [
              { name: 'Badger', skill: 'Foraging' },
              { name: 'Ferret', skill: 'Ferreting' },
            ]
          )
          await commit();
        }
      );
      const committed = await db.all('fetchAnimals')
      t.deepEqual(
        committed,
        [
          { name: 'Badger', skill: 'Foraging' },
          { name: 'Ferret', skill: 'Ferreting' },
        ]
      )
    }
  )

  test.serial( 'transaction with autoCommit',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          await db.run('insertAnimal', ['Badger', 'Foraging']);
          await db.run('insertAnimal', ['Ferret', 'Ferreting']);
          await db.run('insertAnimal', ['Stoat',  'Stoating']);
          const animals = await db.all('fetchAnimals');
          t.deepEqual(
            animals,
            [
              { name: 'Badger', skill: 'Foraging' },
              { name: 'Ferret', skill: 'Ferreting' },
              { name: 'Stoat',  skill: 'Stoating' },
            ]
          )
        },
        { autoCommit: true }
      );
      const committed = await db.all('fetchAnimals')
      t.deepEqual(
        committed,
        [
          { name: 'Badger', skill: 'Foraging' },
          { name: 'Ferret', skill: 'Ferreting' },
          { name: 'Stoat',  skill: 'Stoating' },
        ]
      )
    }
  )

  test.serial( 'db delete animals',
    async t => {
      await db.run('deleteAnimals');
      t.pass();
    }
  );

  test.serial( 'transaction with table rollback',
    async t => {
      await db.transaction(
        async (db, commit, rollback) => {
          const animals = await db.table('animals');
          await animals.insert({ name: 'Badger', skill: 'Foraging'  });
          await animals.insert({ name: 'Ferret', skill: 'Ferreting' });
          const allAnimals = await animals.fetchAll({}, { columns: 'name skill' });
          t.deepEqual(
            allAnimals,
            [
              { name: 'Badger', skill: 'Foraging' },
              { name: 'Ferret', skill: 'Ferreting' },
            ]
          )
          await rollback();
        }
      )
      const committed = await animals.fetchAll()
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'transaction with table commit',
    async t => {
      await db.transaction(
        async (db, commit) => {
          const animals = await db.table('animals');
          await animals.insert({ name: 'Monkey', skill: 'Monkeying' });
          await animals.insert({ name: 'Donkey', skill: 'Donkeying' });
          const allAnimals = await animals.fetchAll({}, { columns: 'name skill' });
          t.deepEqual(
            allAnimals,
            [
              { name: 'Monkey', skill: 'Monkeying' },
              { name: 'Donkey', skill: 'Donkeying' },
            ]
          )
          await commit();
        }
      )
      const committed = await db.all('fetchAnimals')
      t.deepEqual(
        committed,
        [
          { name: 'Monkey', skill: 'Monkeying' },
          { name: 'Donkey', skill: 'Donkeying' },
        ]
      )
    }
  )

  test.serial( 'transaction with db.rollback',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          await db.rollback();
        }
      )
      const committed = await db.all('fetchAnimals')
      t.deepEqual(
        committed,
        [
          { name: 'Monkey', skill: 'Monkeying' },
          { name: 'Donkey', skill: 'Donkeying' },
        ]
      )
    }
  )

  test.serial( 'transaction with db.commit',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          await db.commit();
        }
      )
      const committed = await db.all('fetchAnimals')
      t.is( committed.length, 0 )
    }
  )

  // TODO: database.build..., database.insert(), database.update(), etc.
  // named queries using database builder
  // named table queries using database builder
  // database.model
  // database.waiter

  test.after(
    () => db.disconnect()
  )
}
