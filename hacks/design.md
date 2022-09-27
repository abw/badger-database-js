## Connect

```js
const db = Database(
    engine: 'postgresql://user:password@hostname:3211/database'
    pool: { ... }
)
const db = Database(
    engine: 'mysql://user:password@hostname:3306/database'
)
const db = Database(
    engine: 'sqlite://filename.db'
)
const db = Database(
    engine: 'sqlite://:memory:'
    // or more simply
    engine: 'sqlite:memory'
)
```

```js
const db = await Database(
    engine: {
        driver:   'postgres',
        host:     'localhost',
        database: 'test',
        user:     'test',
        password: 'test',
    }
)
const db = Database(
    // not sure about this...
    sqlite: {
        filename: 'example.db'
    }
)
const db = Database(
    // or this...
    mysql: {
        host:     'localhost',
        database: 'test',
        user:     'test',
        password: 'test',
    }
)
const db = Database(
    // or this...
    postgres: {
        host:     'localhost',
        database: 'test',
        user:     'test',
        password: 'test',
    }
)
```


## Tables

```js
const artists = await db.table('artists');
// vs
const artists = await db.artists;
```

## Records

```js
const floyd = await db.artists.fetchOne({ name: 'Pink Floyd' });
```

## Relations

```js
const albums = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums()
// vs
const albums = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums({ order: 'release_date' })
// vs
const album  = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums({ where: { release_date: 1973 } });
```

```js
// rows vs records
const albums = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums();
const albums = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums().records();
const album  = await db.artists.fetchOne({ name: 'Pink Floyd' }).albums().first().record();
```