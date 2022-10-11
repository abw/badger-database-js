import { fail } from '@abw/badger-utils';
import Builder from '../Builder.js';
import { QueryBuilderError, thrower } from '../Utils/Error.js';

const joinRegex = /^(.*?)=(\w+)\.(\w+)/;
const joinElements = {
  from:  1,
  table: 2,
  to:    3,
};
const joinTypes = {
  left:    'LEFT JOIN ',
  right:   'RIGHT JOIN ',
  inner:   'INNER JOIN ',
  full:    'FULL JOIN ',
  default: 'JOIN ',
};

export const throwJoinError = thrower(
  {
    type:   'Invalid join type "<type>" specified for query builder "join" component.  Valid types are "left", "right", "inner" and "full".',
    string: 'Invalid join string "<join>" specified for query builder "join" component.  Expected "from=table.to".',
    object: 'Invalid object with "<keys>" properties specified for query builder "join" component.  Valid properties are "type", "table", "from" and "to".',
    //array:  'Invalid array with <n> items specified for query builder "select" component. Expected [column, alias] or [table, column, alias].',
  },
  QueryBuilderError
)

export class Join extends Builder {
  initBuilder(...joins) {
    this.key = 'join';
    // TODO: grok the table for columns() to use
    const join = joins.at(-1);
  }

  resolveLinkString(join) {
    // join('a=b.c')
    // join('a.b=c.d')
    let match = join.match(joinRegex);
    let config = { };
    if (match) {
      Object.entries(joinElements).map(
        ([key, index]) => config[key] = match[index]
      );
      // console.log('parsed join string [%s]:', config);
      return this.resolveLinkObject(config);
    }
    throwJoinError('string', { join });
    // return this.resolveLinkArray(splitList(columns), context);
  }

  TODOresolveLinkArray(join) {
  }

  resolveLinkObject(join) {
    if (join.table && join.from && join.to) {
      const type = joinTypes[join.type || 'default']
        || throwJoinError('type', { type: join.type });
      return this.constructJoin(
        type, join.table, join.from, this.tableColumn(join.table, join.to)
      );
    }
    throwJoinError('object', { keys: Object.keys(join).sort().join(', ') });
  }

  constructJoin(type, table, from, to) {
    return type
      + this.quote(table)
      + ' ON '
      + this.quote(from)
      + '='
      + this.quote(to);
  }
}

export default Join