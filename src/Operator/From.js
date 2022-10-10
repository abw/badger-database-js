import { fail, isArray, isObject, isString, splitList } from '@abw/badger-utils';
import Operator from '../Operator.js';

export class From extends Operator {
  initOperator(...tables) {
    this.key = 'from';
    // console.log('FROM: ', table);
    // store the table name for subsequent select() calls to use, but
    // we need to be careful to only handle the valid cases, e.g. where
    // it's a string (which might contain multiple table names) or an
    // array
    const table = tables.at(-1);
    if (isString(table)) {
      this.table = splitList(table).at(-1);
    }
    else if (isArray(table)) {
      this.table = table.at(-1);
    }
    else if (isObject(table) && table.as) {
      this.table = table.as;
    }
  }
  resolve(context) {
    return super.resolve(context, { table: this.table });
  }
  resolveLinkString(tables, context) {
    return this.resolveLinkArray(splitList(tables), context);
  }
  resolveLinkArray(tables, context) {
    return tables.map(
      table => this.quote(table, context)
    )
  }
  resolveLinkObject(table, context) {
    if (table.table && table.as) {
      return [
        this.quote(table.table, context),
        this.quote(table.as, context)
      ].join(' AS ');
    }
    return fail('Invalid table specified in "from": ', table);
  }
}

export default From