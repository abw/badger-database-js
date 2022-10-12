import { splitList } from '@abw/badger-utils';
import Builder from '../Builder.js';

const ASC  = 'ASC';
const DESC = 'DESC';

export class Order extends Builder {
  initBuilder() {
    this.key = 'order';
    this.messages = {
      array:  'Invalid array with <n> items specified for query builder "<type>" component. Expected [column, direction] or [column].',
      object: 'Invalid object with "<keys>" properties specified for query builder "<type>" component.  Valid properties are "columns", "column", "direction", "dir", "asc" and "desc".',
    };
  }

  resolveLinkString(order, dir) {
    return splitList(order).map(
      column => this.constructOrder(column)
    ).join(', ') + (dir ? ` ${dir}` : '');
  }

  resolveLinkArray(order) {
    if (order.length === 2 || order.length === 1) {
      return this.constructOrder(...order);
    }
    this.errorMsg('array', { n: order.length });
  }

  resolveLinkObject(order) {
    const dir = order.direction || order.dir
      || (order.desc && DESC)
      || (order.asc  && ASC);

    if (order.column) {
      return this.constructOrder(order.column, dir);
    }
    else if (order.columns) {
      return this.resolveLinkString(order.columns, dir)
    }
    this.errorMsg('object', { keys: Object.keys(order).sort().join(', ') });
  }
  constructOrder(column, dir) {
    return this.quote(column) + (dir ? ` ${dir}` : '');
  }
}

export default Order