import Builder from '../Builder.js';
import { splitList } from '@abw/badger-utils';
import { QueryBuilderError, thrower } from '../Utils/Error.js';

export const throwGroupError = thrower(
  {
    array:  'Invalid array with <n> items specified for query builder "group" component. Expected [column].',
    object: 'Invalid object with "<keys>" properties specified for query builder "group" component.  Valid properties are "columns" and "column".',
  },
  QueryBuilderError
)

export class Group extends Builder {
  initBuilder() {
    this.key = 'group';
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
    throwGroupError('array', { n: group.length });
  }

  resolveLinkObject(group) {
    if (group.column) {
      return this.quote(group.column);
    }
    else if (group.columns) {
      return this.resolveLinkString(group.columns)
    }
    throwGroupError('object', { keys: Object.keys(group).sort().join(', ') });
  }
}

export default Group