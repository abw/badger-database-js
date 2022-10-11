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

* standardise arguments to builders, e.g. use Array for something other than repeating
  arguments

* Check builder placeholder variables are correct in Postgres

* Proper error reporting (custom Error class and messages) in builders

* Builder values() is currently a method but we probably need to create a builder
  component for adding values.

* Where should calls addValues();

* Where array