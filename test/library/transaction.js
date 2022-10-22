import test from 'ava';
import { connect } from "../../src/index.js";
import { databaseConfig } from './database.js';
import { setDebug } from '../../src/Utils/Debug.js';

setDebug({
  // engine: true,
})

export const runTransactionTests = async (engine) => {
  test.todo( 'transaction support is a work in progress ');
}

/*
export const runTransactionTests = async (engine) => {
  const database = databaseConfig(engine);
  const sqlite   = engine === 'sqlite';
  const mysql    = engine === 'mysql';
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

  test.serial( 'begin transaction query',
    async t => {
      const trans = db.engine.constructor.beginTrans;
      if (mysql) {
        t.is( trans, 'START TRANSACTION' );
      }
      else {
        t.is( trans, 'BEGIN' )
      }
    }
  )

  test.serial( 'db transaction with rollback',
    async t => {
      await db.transaction(
        async (db, commit, rollback) => {
          console.log('running transaction code');
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
      const commited = await db.all('fetchAnimals')
      t.is( commited.length, 0 )
    }
  )
  */

  /*
  test.serial( 'db begin...rollback',
    async t => {
      await db.begin();
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
      await db.rollback();
      const commited = await db.all('fetchAnimals')
      t.is( commited.length, 0 )
    }
  )

  test.serial( 'db begin...commit',
    async t => {
      await db.begin();
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
      await db.commit();
      const commited = await db.all('fetchAnimals')
      t.deepEqual(
        commited,
        [
          { name: 'Badger', skill: 'Foraging' },
          { name: 'Ferret', skill: 'Ferreting' },
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

  test.serial( 'table begin...rollback',
    async t => {
      await animals.begin();
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
      await db.rollback();
      const commited = await animals.fetchAll()
      t.is( commited.length, 0 )
    }
  )

  test.serial( 'table begin...rollback',
    async t => {
      await animals.begin();
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
      await db.rollback();
      const commited = await animals.fetchAll()
      t.is( commited.length, 0 )
    }
  )
  */
/*
  test.after(
    () => db.disconnect()
  )
}
*/