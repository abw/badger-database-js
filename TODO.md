* Configuration from env

* Connection string options: `sqlite:memory?debug&debugPrefix=SQL> &blahblah`

* should table insert() have option to return data (with id added) instead of
  re-fetching row?

* table fetch columns with aliases: { alias: column } ???

* relations - clean up and document

* relations: from (localKey) / to (remoteKey)

* relations short form: localKey -> table.remoteKey

{
  artist: artist_id -> artists.id
  tracks: id => tracks.albums_id
}

* query builder (operations)

* document query() method to view generated SQL

* additional 'where' criteria for relations (check names get properly quoted)