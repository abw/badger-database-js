* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* fetch() vs select()

* get(), set(), put(), del()?

* sanitizeResult() will only set `changes` when `insert` is added, but that
doesn't apply when creating a table, for example.  Perhaps this should have
different options, e.g. { changes: true, id: true }, { id: 'user_id' },
{ changes: 'rowsChanged' }, { keys: [a, b] } etc

