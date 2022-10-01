* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* fetch() vs select() - fetch({ where... }) should return all columns by
default, select() should start a select query

* fetchOne(), fetchAny(), fetchAll()

* get(), set(), put(), del()?

* table insert() should re-fetch row.  HMMM... on second thoughts (now that I've
implemented it), it shouldn't be default.  The { reload: true } should be added
to make it happen, rather than { reload: false } to disabled it.

* table records


