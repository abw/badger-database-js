* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* table insert() should have option to return data (with id added) instead of
  re-fetching row.

* oneRow/anyRow/allRows, etc., should have order_by?

* Should table record() return a record proxy? Or should the record put the
data in this?  Or should it keep it in this.row as it does currently?

* split tutorial into separate pages