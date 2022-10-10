* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* should table insert() have option to return data (with id added) instead of
  re-fetching row?

* table fetch columns with aliases: { alias: column } ???

* document query() method to view generated SQL

* additional 'where' criteria for relations (check names get properly quoted)

* waiter is not throwing errors

* database inspection to grok tables automagically?

* search component / query builder (operations)

* API documentation

* debug documenation - prefix and color

* operators: where() should not prefix columns with the most recent table name
  because then there's no way to NOT add a prefix, e.g. when aliasing companies.id
  to company_id you can't select where company_id: xxx (although you can still use
  companies.id). Perhaps where(), select(), etc., SHOULDN'T add table names by
  default.  It can be done with { table: "users", columns: "id name etc", prefix: "user_" }
  which seems like a better approach.  Less magic by default.
  Perhaps we could use the array for this: select(["users", "id name email"]) perhaps with
  optional prefix: select("users", "id name email", "user_")?  Or maybe that should be
  a hash? e.g. select("users", "id name email", { prefix: "user_" }).  I'm not sure about
  that.  Feels better to allow columns to be listed out, e.g. select(["users", "id", "name", "email"])
  although that does then make it less obvious that the "users" 0th item is the table name.