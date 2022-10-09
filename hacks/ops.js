// this is a work in progress, trying out some basic query builder ideas
import Operator from '../src/Operator.js'
import factory from '../src/Operators.js'
import operatorProxy from '../src/Proxy/Operator.js';

const op    = new Operator(factory);
const proxy = operatorProxy(op);
const users = proxy
  .select('CONCAT_WS(" ", user.forename, user.surname) as name, user.email, company.name as company')
  .from('user')
  .join('employee ON employee.user_id=user.id')
  .join('company ON company.id=employee.company_id')

const usersWithMultipleCompanies = users
  .select('COUNT(DISTINCT company.id) as n_companies')
  .group('user.id')
  .having('n_companies > 1')
  .order('n_companies DESC')

const fiveUsersWithMultipleCompanies = usersWithMultipleCompanies
  .after('LIMIT 5')


console.log('-- users --');
console.log(users.sql(), "\n");
console.log('-- users with multiple companies --');
console.log(usersWithMultipleCompanies.sql(), "\n");
console.log('-- five users with multiple companies --');
console.log(fiveUsersWithMultipleCompanies.sql(), "\n");
