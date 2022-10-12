* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* should table insert() have option to return data (with id added) instead of
  re-fetching row?

* table fetch columns with aliases: { alias: column } ???

* document query() method to view generated SQL (rename sql()?)

* additional 'where' criteria for relations (check names get properly quoted)

* waiter is not throwing errors

* database inspection to grok tables automagically?

* API documentation

* debug documentation - prefix and color

* Extending documentation - adding engines, adding builders

* Documentation for query builder - mention that we only support select at this
time.  Also mention the db.builder() function if you want to start a query with
anything other than select() or from()

* Query builder - add support for with()

* Builder join() string - use different arrows for LEFT/RIGHT/INNER/FULL
  a=b    # INNER
  a=>b   # LEFT
  a<=b   # RIGHT
  a<=>b  # FULL