import Builder from '../Builder'
import { splitList } from '@abw/badger-utils'
import { comma, GROUP_BY } from '../Constants'

export type GroupByColumn = string | string[] | GroupByObject
export type GroupByObject = {
  column?: string
  columns?: string
  sql?: string | TemplateStringsArray
}

export class Group extends Builder {
  static buildMethod = 'group'
  static buildAlias  = 'groupBy'
  static buildOrder  = 60
  static keyword     = GROUP_BY
  static joint       = comma
  static messages    = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column].',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "columns" and "column".',
  }

  resolveLinkString(group: string) {
    return splitList(group).map(
      (column: string) => this.quote(column)
    )
  }

  resolveLinkArray(group: string[]) {
    if (group.length === 1) {
      return this.quote(group[0]);
    }
    this.errorMsg('array', { n: group.length });
  }

  resolveLinkObject(group: GroupByObject) {
    if (group.column) {
      return this.quote(group.column);
    }
    else if (group.columns) {
      return this.resolveLinkString(group.columns)
    }
    this.errorMsg('object', { keys: Object.keys(group).sort().join(', ') });
  }
}

export default Group