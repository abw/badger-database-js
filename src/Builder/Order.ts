import Builder from '../Builder'
import { splitList } from '@abw/badger-utils'
import { comma, ASC, DESC, ORDER_BY, space } from '../Constants'

export type OrderBuilderOrder = {
  direction?: string
  dir?: string
  asc?: boolean
  desc?: boolean
  column?: string
  columns?: string
}

export class Order extends Builder {
  static buildMethod = 'order'
  static buildAlias  = 'orderBy'
  static buildOrder  = 80
  static keyword     = ORDER_BY
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, direction] or [column].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "columns", "column", "direction", "dir", "asc" and "desc".',
  };

  resolveLinkString(order: string | string[], dir?: string) {
    return splitList(order).map(
      (column: string) => this.constructOrder(column)
    ).join(', ') + (dir ? space + dir : '')
  }

  resolveLinkArray(order: string[]) {
    if (order.length === 2 || order.length === 1) {
      const [column, dir] = order
      return this.constructOrder(column, dir)
    }
    this.errorMsg('array', { n: order.length });
  }

  resolveLinkObject(order: OrderBuilderOrder) {
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

  constructOrder(column: string, dir?: string) {
    return this.quote(column) + (dir ? space + dir : '');
  }
}

export default Order