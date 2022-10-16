import { Table } from '@abw/badger-database'
import User from '../Record/User.js';

export class Users extends Table {
  configure(schema) {
    schema.columns = 'id company_id name email';
    schema.recordClass = User;
  }
}

export default Users
