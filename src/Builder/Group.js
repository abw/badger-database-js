import Builder from '../Builder.js';
import { splitList } from '@abw/badger-utils';

export class Group extends Builder {
  initBuilder() {
    this.key = 'group';
    this.messages = {
      array:  'Invalid array with <n> items specified for query builder "<type>" component. Expected [column].',
      object: 'Invalid object with "<keys>" properties specified for query builder "<type>" component.  Valid properties are "columns" and "column".',
    };
  }
  resolveLinkString(group) {
    return splitList(group).map(
      column => this.quote(column)
    )
  }
  resolveLinkArray(group) {
    if (group.length === 1) {
      return this.quote(group[0]);
    }
    this.errorMsg('array', { n: group.length });
  }

  resolveLinkObject(group) {
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