# Badger Database

This is a work in progress to create a Javascript
database library loosely based on the Perl
[Badger::Database](https://github.com/abw/Badger-Database) library.

It is built around [Knex.js](https://knexjs.org/)

It is planned to help migrate some old Perl code
to Javascript and probably isn't going to be
suitable for new projects.

## TODO

Decide on the format for specifying columns/column sets.

Currently : "column1 column2" for columns and/or "@colset1 @colset2"
for columns sets.

Might make more sense to use ...

e.g. table.select("column1 column2 ...colset1 ...colset2")

Would be nice to use that to auto-join to related tables.
e.g. use "@relatedTable" to reference columns in related
table.

properties.select("@address")  # default set in related address table
properties.select("...admin@address")  # admin set in related address table

How to specify multiple columns from another set?
properties.select("line1@address line2@address line3@address")  # yawn
properties.select("line1,line2@address")   # Nope, we allow "," as a normal column delimiter
properties.select("line1&line2@address")   # Not loving it
properties.select("line1|line2@address")   # Nope
properties.select("[line1 line2]@address") # Yech - space causes parsing hardness
properties.select("line1+line2@address")   # Maybe
properties.select("line1+line2@address")   # Maybe - but implies "a+b+c" is valid