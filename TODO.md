* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* fetch() vs select() - fetch({ where... }) should return all columns by
default, select() should start a select query

* oneRow(), anyRow(), allRows()

* oneRecord(), anyRecord(), allRecords()

* table insert() should have option to return data (with id added) instead of
  re-fetching row.

* table records

* oneRow/anyRow/allRows, etc., should have order_by?

