import { expect, test } from 'vitest'
import { connect } from "../../src/index.js"
import { databaseConfig } from './database.js'
import { setDebug } from '../../src/Utils/Debug.js'
import { pass } from './expect.js'

setDebug({
  // engine: true,
  // transaction: true,
})

export const runTransactionTests = async (engine) => {
  const database = databaseConfig(engine)
  const sqlite   = engine === 'sqlite'
  const postgres = engine === 'postgres'
  const ph1      = postgres ? '$1' : '?'
  const ph2      = postgres ? '$2' : '?'
  const serial   = sqlite ? 'INTEGER PRIMARY KEY ASC'  : 'SERIAL'
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

  const animals = await db.table('animals')
  // let Bobby, Brian, Franky, Fiona;

  test( 'drop/create table',
    async () => {
      await db.run('dropAnimalsTable')
      await db.run('createAnimalsTable')
      pass()
    }
  )

  test( 'transaction with rollback',
    async () => {
      await db.transaction(
        async (db, commit, rollback) => {
          await db.run('insertAnimal', ['Badger', 'Foraging'])
          await db.run('insertAnimal', ['Ferret', 'Ferreting'])
          const animals = await db.all('fetchAnimals');
          expect(animals).toStrictEqual([
            { name: 'Badger', skill: 'Foraging' },
            { name: 'Ferret', skill: 'Ferreting' },
          ])
          await rollback()
        }
      );
      const committed = await db.all('fetchAnimals')
      expect(committed.length).toBe(0)
    }
  )

  test( 'transaction with autoRollback',
    async () => {
      await db.transaction(
        async db => {
          await db.run('insertAnimal', ['Badger', 'Foraging'])
          await db.run('insertAnimal', ['Ferret', 'Ferreting'])
          const animals = await db.all('fetchAnimals')
          expect(animals).toStrictEqual([
            { name: 'Badger', skill: 'Foraging' },
            { name: 'Ferret', skill: 'Ferreting' },
          ])
        },
        { autoRollback: true }
      );
      const committed = await db.all('fetchAnimals')
      expect(committed.length).toBe(0)
    }
  )

  test( 'transaction with commit',
    async () => {
      await db.transaction(
        async (db, commit) => {
          await db.run('insertAnimal', ['Badger', 'Foraging'])
          await db.run('insertAnimal', ['Ferret', 'Ferreting'])
          const animals = await db.all('fetchAnimals')
          expect(animals).toStrictEqual([
            { name: 'Badger', skill: 'Foraging' },
            { name: 'Ferret', skill: 'Ferreting' },
          ])
          await commit();
        }
      );
      const committed = await db.all('fetchAnimals')
      expect(committed).toStrictEqual([
        { name: 'Badger', skill: 'Foraging' },
        { name: 'Ferret', skill: 'Ferreting' },
      ])
    }
  )

  test( 'transaction with autoCommit',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          await db.run('insertAnimal', ['Badger', 'Foraging'])
          await db.run('insertAnimal', ['Ferret', 'Ferreting'])
          await db.run('insertAnimal', ['Stoat',  'Stoating'])
          const animals = await db.all('fetchAnimals')
          expect(animals).toStrictEqual([
            { name: 'Badger', skill: 'Foraging' },
            { name: 'Ferret', skill: 'Ferreting' },
            { name: 'Stoat',  skill: 'Stoating' },
          ])
        },
        { autoCommit: true }
      );
      const committed = await db.all('fetchAnimals')
      expect(committed).toStrictEqual([
        { name: 'Badger', skill: 'Foraging' },
        { name: 'Ferret', skill: 'Ferreting' },
        { name: 'Stoat',  skill: 'Stoating' },
      ])
    }
  )

  test( 'db delete animals',
    async () => {
      await db.run('deleteAnimals')
      pass()
    }
  );

  test( 'transaction with table rollback',
    async () => {
      await db.transaction(
        async (db, commit, rollback) => {
          const animals = await db.table('animals')
          await animals.insert({ name: 'Badger', skill: 'Foraging'  })
          await animals.insert({ name: 'Ferret', skill: 'Ferreting' })
          const allAnimals = await animals.fetchAll({}, { columns: 'name skill' })
          expect(allAnimals).toStrictEqual([
            { name: 'Badger', skill: 'Foraging' },
            { name: 'Ferret', skill: 'Ferreting' },
          ])
          await rollback()
        }
      )
      const committed = await animals.fetchAll()
      expect(committed.length).toBe(0)
    }
  )

  test( 'transaction with table commit',
    async () => {
      await db.transaction(
        async (db, commit) => {
          const animals = await db.table('animals')
          await animals.insert({ name: 'Monkey', skill: 'Monkeying' })
          await animals.insert({ name: 'Donkey', skill: 'Donkeying' })
          const allAnimals = await animals.fetchAll({}, { columns: 'name skill' })
          expect(allAnimals).toStrictEqual([
            { name: 'Monkey', skill: 'Monkeying' },
            { name: 'Donkey', skill: 'Donkeying' },
          ])
          await commit()
        }
      )
      const committed = await db.all('fetchAnimals')
      expect(committed).toStrictEqual([
        { name: 'Monkey', skill: 'Monkeying' },
        { name: 'Donkey', skill: 'Donkeying' },
      ])
    }
  )

  test( 'transaction with db.rollback',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          await db.rollback();
        }
      )
      const committed = await db.all('fetchAnimals')
      expect(committed).toStrictEqual([
        { name: 'Monkey', skill: 'Monkeying' },
        { name: 'Donkey', skill: 'Donkeying' },
      ])
    }
  )

  test( 'transaction with db.commit',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          await db.commit();
        }
      )
      const committed = await db.all('fetchAnimals')
      expect(committed.length).toBe(0)
    }
  )

  test( 'db.insert() with rollback',
    async () => {
      await db.transaction(
        async db => {
          const insert = db.insert('name').into('animals')
          await insert.run(['Aardvark'])
          await insert.run(['Badger'])
          await insert.run(['Camel'])
          const rows = await db.select('name').from('animals').all()
          expect(rows).toStrictEqual([
            { name: 'Aardvark' },
            { name: 'Badger'   },
            { name: 'Camel'    },
          ])
          await db.rollback()
        }
      )
      const committed = await db.all('fetchAnimals')
      expect(committed.length).toBe(0)
    }
  )

  test( 'db.insert() with commit',
    async () => {
      await db.transaction(
        async db => {
          const insert = db.insert('name').into('animals')
          await insert.run(['Aardvark'])
          await insert.run(['Badger'])
          await insert.run(['Camel'])
          const rows = await db.select('name').from('animals').all()
          expect(rows).toStrictEqual([
            { name: 'Aardvark' },
            { name: 'Badger'   },
            { name: 'Camel'    },
          ])
          await db.commit()
        }
      )
      const committed = await db.select('name').from('animals').all();
      expect(committed).toStrictEqual([
        { name: 'Aardvark' },
        { name: 'Badger'   },
        { name: 'Camel'    },
      ])
    }
  )

  test( 'db named query with rollback',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const insert = db.insert('name skill').into('animals')
          await insert.run(['Brian Badger', 'Foraging' ])
          await insert.run(['Bobby Badger', 'Foraging' ])
          await insert.run(['Colin Camel',  'Wandering'])
          const rows = await db.all('selectBySkill', ['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.rollback()
        }
      )
      const committed = await db.all('selectBySkill', ['Foraging'])
      expect(committed.length).toBe(0)
    }
  )

  test( 'db named query with commit',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals');
          const insert = db.insert('name skill').into('animals')
          await insert.run(['Brian Badger', 'Foraging' ])
          await insert.run(['Bobby Badger', 'Foraging' ])
          await insert.run(['Colin Camel',  'Wandering'])
          const rows = await db.all('selectBySkill', ['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.commit()
        }
      )
      const committed = await db.all('selectBySkill', ['Foraging'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Foraging' },
        { name: 'Bobby Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'db delete animals again',
    async () => {
      await db.run('deleteAnimals')
      pass()
    }
  );

  test( 'table query builder with rollback',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          const animals = await db.table('animals')
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.select('name skill').where('skill').all(['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.rollback()
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging']);
      expect(committed.length).toBe(0)
    }
  )

  test( 'table query builder with commit',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          const animals = await db.table('animals')
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.select('name skill').where('skill').all(['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.commit()
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Foraging' },
        { name: 'Bobby Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'db delete animals yet again',
    async () => {
      await db.run('deleteAnimals')
      pass()
    }
  );

  test( 'table named query with rollback',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          const animals = await db.table('animals')
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.all('selectBySkill', ['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.rollback()
        },
        // { debug: true }
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      expect(committed.length).toBe(0)
    }
  )

  test( 'table named query with commit',
    async () => {
      await db.transaction(
        async db => {
          await db.run('deleteAnimals')
          const animals = await db.table('animals')
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.all('selectBySkill', ['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.commit()
        },
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Foraging' },
        { name: 'Bobby Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'record update with rollback',
    async () => {
      await db.transaction(
        async db => {
          const animals = await db.table('animals')
          const brian = await animals.fetchRecord({
            name: 'Brian Badger'
          })
          expect(brian.skill).toBe('Foraging')
          await brian.update({ skill: 'Badgering' });
          const rows = await animals.all('selectBySkill', ['Badgering']);
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Badgering' },
          ])
          await db.rollback()
        },
      )
      const committed = await animals.all('selectBySkill', ['Foraging'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Foraging' },
        { name: 'Bobby Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'record update with commit',
    async () => {
      await db.transaction(
        async db => {
          const animals = await db.table('animals')
          const brian = await animals.fetchRecord({
            name: 'Brian Badger'
          })
          expect(brian.skill).toBe('Foraging')
          await brian.update({ skill: 'Badgering' })
          const rows = await animals.all('selectBySkill', ['Badgering'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Badgering' },
          ])
          await db.commit()
        },
      )
      const committed = await animals.all('selectBySkill', ['Badgering'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Badgering' },
      ])
    }
  )

  test( 'cry havoc and let slip the animals of testing',
    async () => {
      await db.run('deleteAnimals')
      pass()
    }
  );

  test( 'table via model with rollback',
    async () => {
      await db.transaction(
        async db => {
          const animals = await db.model.animals
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.select('name skill').where('skill').all(['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.rollback()
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging']);
      expect(committed.length).toBe(0)
    }
  )

  test( 'table via model with commit',
    async () => {
      await db.transaction(
        async db => {
          const animals = await db.model.animals
          await animals.insert([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
            { name: 'Colin Camel',  skill: 'Wandering'}
          ])
          const rows = await animals.select('name skill').where('skill').all(['Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Brian Badger', skill: 'Foraging' },
            { name: 'Bobby Badger', skill: 'Foraging' },
          ])
          await db.commit()
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging'])
      expect(committed).toStrictEqual([
        { name: 'Brian Badger', skill: 'Foraging' },
        { name: 'Bobby Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'waiter',
    async () => {
      await db.waiter.model.animals
        .fetchRecord({ name: 'Brian Badger' })
        .update({ name: 'Brian the Badger' })
      const rows = await animals
        .select('name skill')
        .where('skill')
        .order('name')
        .all(['Foraging'])
      expect(rows).toStrictEqual([
        { name: 'Bobby Badger', skill: 'Foraging' },
        { name: 'Brian the Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'waiter rollback',
    async () => {
      await db.transaction(
        async db => {
          await db.waiter.model.animals
            .fetchRecord({ name: 'Bobby Badger' })
            .update({ name: 'Bobby the Badger' })
          const rows = await db.waiter.model.animals
            .select('name skill')
            .where('name skill')
            .all(['Bobby the Badger', 'Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Bobby the Badger', skill: 'Foraging' },
          ])
          await db.rollback()
        }
      )
      const committed = await animals
        .select('name skill')
        .where('skill')
        .order('name')
        .all(['Foraging']);
      expect(committed).toStrictEqual([
        { name: 'Bobby Badger', skill: 'Foraging' },
        { name: 'Brian the Badger', skill: 'Foraging' },
      ])
    }
  )

  test( 'waiter commit',
    async () => {
      await db.transaction(
        async db => {
          await db.waiter.model.animals
            .fetchRecord({ name: 'Bobby Badger' })
            .update({ name: 'Bobby the Badger' })
          const rows = await db.waiter.model.animals
            .select('name skill')
            .where('name skill')
            .all(['Bobby the Badger', 'Foraging'])
          expect(rows).toStrictEqual([
            { name: 'Bobby the Badger', skill: 'Foraging' },
          ])
          await db.commit()
        }
      )
      const committed = await animals.select('name skill').where('skill').all(['Foraging']);
      expect(committed).toStrictEqual([
        { name: 'Brian the Badger', skill: 'Foraging' },
        { name: 'Bobby the Badger', skill: 'Foraging' },
      ])
    }
  )

  test(
    'disconnect',
    () => db.disconnect()
  )
}
