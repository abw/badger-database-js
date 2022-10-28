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
    `,
    selectBySkill:
      db => db.select('name skill').from('animals').where('skill')
  };

  test.serial('hello',
    t => t.pass()
  );

  const tables = {
    animals: {
      columns: 'id name skill',
      queries: {
        selectBySkill:
          t => t.select('name skill').where('skill')
      }
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

  test.serial( 'db.insert() with rollback',
    async t => {
      await db.transaction(
        async db => {
          const insert = db.insert('name').into('animals');
          await insert.run(['Aardvark'])
          await insert.run(['Badger'])
          await insert.run(['Camel'])
          const rows = await db.select('name').from('animals').all();
          t.deepEqual(
            rows,
            [
              { name: 'Aardvark' },
              { name: 'Badger'   },
              { name: 'Camel'    },
            ]
          )
          await db.rollback();
        }
      )
      const committed = await db.all('fetchAnimals')
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'db.insert() with commit',
    async t => {
      await db.transaction(
        async db => {
          const insert = db.insert('name').into('animals');
          await insert.run(['Aardvark'])
          await insert.run(['Badger'])
          await insert.run(['Camel'])
          const rows = await db.select('name').from('animals').all();
          t.deepEqual(
            rows,
            [
              { name: 'Aardvark' },
              { name: 'Badger'   },
              { name: 'Camel'    },
            ]
          )
          await db.commit();
        }
      )
      const committed = await db.select('name').from('animals').all();
      t.deepEqual(
        committed,
        [
          { name: 'Aardvark' },
          { name: 'Badger'   },
          { name: 'Camel'    },
        ]
      )
    }
  )

  test.serial( 'db named query with rollback',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const insert = db.insert('name skill').into('animals');
          await insert.run(['Brian Badger', 'Foraging' ])
          await insert.run(['Bobby Badger', 'Foraging' ])
          await insert.run(['Colin Camel',  'Wandering'])
          const rows = await db.all('selectBySkill', ['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.rollback();
        }
      )
      const committed = await db.all('selectBySkill', ['Foraging'])
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'db named query with commit',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const insert = db.insert('name skill').into('animals');
          await insert.run(['Brian Badger', 'Foraging' ])
          await insert.run(['Bobby Badger', 'Foraging' ])
          await insert.run(['Colin Camel',  'Wandering'])
          const rows = await db.all('selectBySkill', ['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.commit();
        }
      )
      const committed = await db.all('selectBySkill', ['Foraging'])
      t.deepEqual(
        committed,
        [
          { name: 'Brian Badger', skill: 'Foraging' },
          { name: 'Bobby Badger', skill: 'Foraging' },
        ]
      )
    }
  )

  test.serial( 'db delete animals again',
    async t => {
      await db.run('deleteAnimals');
      t.pass();
    }
  );

  test.serial( 'table query builder with rollback',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const animals = await db.table('animals');
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ]);
          const rows = await animals.select('name skill').where('skill').all(['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.rollback();
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging']);
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'table query builder with commit',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const animals = await db.table('animals');
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ]);
          const rows = await animals.select('name skill').where('skill').all(['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.commit();
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging']);
      t.deepEqual(
        committed,
        [
          { name: 'Brian Badger', skill: 'Foraging' },
          { name: 'Bobby Badger', skill: 'Foraging' },
        ]
      )
    }
  )

  test.serial( 'db delete animals yet again',
    async t => {
      await db.run('deleteAnimals');
      t.pass();
    }
  );

  test.serial( 'table named query with rollback',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const animals = await db.table('animals');
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ]);
          const rows = await animals.all('selectBySkill', ['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.rollback();
        },
        // { debug: true }
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      t.is( committed.length, 0 )
    }
  )

  test.serial( 'table named query with commit',
    async t => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const animals = await db.table('animals');
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ]);
          const rows = await animals.all('selectBySkill', ['Foraging']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Foraging' },
              { name: 'Bobby Badger', skill: 'Foraging' },
            ]
          )
          await db.commit();
        },
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      t.deepEqual(
        committed,
        [
          { name: 'Brian Badger', skill: 'Foraging' },
          { name: 'Bobby Badger', skill: 'Foraging' },
        ]
      )
    }
  )

  test.serial( 'record update with rollback',
    async t => {
      await db.transaction(
        async db => {
          const animals = await db.table('animals');
          const brian = await animals.fetchRecord({
            name: 'Brian Badger'
          })
          t.is( brian.skill, 'Foraging' );
          brian.update({ skill: 'Badgering' });
          const rows = await animals.all('selectBySkill', ['Badgering']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Badgering' },
            ]
          )
          await db.rollback();
        },
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      t.deepEqual(
        committed,
        [
          { name: 'Brian Badger', skill: 'Foraging' },
          { name: 'Bobby Badger', skill: 'Foraging' },
        ]
      )
    }
  )

  test.serial( 'record update with commit',
    async t => {
      await db.transaction(
        async db => {
          const animals = await db.table('animals');
          const brian = await animals.fetchRecord({
            name: 'Brian Badger'
          })
          t.is( brian.skill, 'Foraging' );
          brian.update({ skill: 'Badgering' });
          const rows = await animals.all('selectBySkill', ['Badgering']);
          t.deepEqual(
            rows,
            [
              { name: 'Brian Badger', skill: 'Badgering' },
            ]
          )
          await db.commit();
        },
      )
      const committed = await animals.all('selectBySkill', ['Badgering'])
      t.deepEqual(
        committed,
        [
          { name: 'Brian Badger', skill: 'Badgering' },
        ]
      )
    }
  )

  // TODO
  // database.model
  // database.waiter

  test.after(
    () => db.disconnect()
  )
}
