* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* table should have one(), any() and all() methods for running queries (with
expanded fragments)

* fetch() vs select() - fetch({ where... }) should return all columns by
default, select() should start a select query

* oneRow(), anyRow(), allRows()

* oneRecord(), anyRecord(), allRecords()

* table insert() should have option to return data (with id added) instead of
  re-fetching row.

* table records

* oneRow/anyRow/allRows, etc., should have order_by?

* Should table record() return a record proxy? Or should the record put the
data in this?  Or should it keep it in this.row as it does currently?