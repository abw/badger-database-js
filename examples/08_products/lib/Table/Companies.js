import { Table } from '@abw/badger-database'

export class Companies extends Table {
  configure(schema) {
    schema.columns = 'id name';
  }
}

export default Companies