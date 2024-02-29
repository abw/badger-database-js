# Notes

## Naming Case Conventions

The Javascript convention is to use StudlyCaps for class names (e.g. `Artists`) and
camelCase for methods, function, variables, etc., (e.g. `albumTracks`).

When it comes to database table and columns names you might want to adopt the same
convention.  That's fine.  However, be warned that many databases are case insensitive
by default.  As a result you might find that the database you're using returns the
data with column names converted to lower case.  Most databases have an option to make
it case sensitive so you might want to look into that.

I prefer to avoid the problem altogether by defining my database tables and columns using
snake_case (e.g. `artists`, `artist_id`, `album_tracks`, etc). I typically use a number
of other programming languages to access the same database in a project and many other
languages (e.g. Rust, Perl, Python, PHP, etc.) use snake_case by convention.

In these examples I've adopted this convention because it's what works for me.  It doesn't
bother me that I have to think in snake_case when I'm accessing row data, but camelCase
when using method names.  In fact, I think it probably helps me to differentiate between
"raw" data from the database and code.  You may disagree, and of course, you are free to
adopt your own convention that does it differently.

