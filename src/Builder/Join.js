import Builder from '../Builder.js';

const tableColumnRegex = /^(\w+)\.(\w+)$/;
const joinRegex = /^(.*?)=(\w+)\.(\w+)$/;
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


export class Join extends Builder {
  initBuilder() {
    this.key = 'join';
    this.messages = {
      type:   'Invalid join type "<joinType>" specified for query builder "<type>" component.  Valid types are "left", "right", "inner" and "full".',
      string: 'Invalid join string "<join>" specified for query builder "<type>" component.  Expected "from=table.to".',
      object: 'Invalid object with "<keys>" properties specified for query builder "<type>" component.  Valid properties are "type", "table", "from" and "to".',
      array:  'Invalid array with <n> items specified for query builder "<type>" component. Expected [type, from, table, to], [from, table, to] or [from, table.to].',
    };
    // TODO: grok the table for columns() to use
    // const join = joins.at(-1);
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
    this.errorMsg('string', { join });
    // return this.resolveLinkArray(splitList(columns), context);
  }

  resolveLinkArray(join) {
    if (join.length === 4) {
      const [type, from, table, to] = join;
      return this.resolveLinkObject({ type, from, table, to });
    }
    else if (join.length === 3) {
      const [from, table, to] = join;
      return this.resolveLinkObject({ from, table, to });
    }
    else if (join.length === 2) {
      const match = join[1].match(tableColumnRegex);
      if (match) {
        const from = join[0];
        const [ , table, to] = match;
        return this.resolveLinkObject({ from, table, to });
      }
    }
    this.errorMsg('array', { n: join.length });
  }

  resolveLinkObject(join) {
    const type = joinTypes[join.type || 'default']
      || this.errorMsg('type', { joinType: join.type });

    if (join.table && join.from && join.to) {
      return this.constructJoin(
        type, join.from, join.table, this.tableColumn(join.table, join.to)
      );
    }
    else if (join.from && join.to) {
      const match = join.to.match(tableColumnRegex);
      if (match) {
        return this.constructJoin(
          type, join.from, match[1], this.tableColumn(match[1], match[2])
        )
      }
    }
    this.errorMsg('object', { keys: Object.keys(join).sort().join(', ') });
  }

  constructJoin(type, from, table, to) {
    return type
      + this.quote(table)
      + ' ON '
      + this.quote(from)
      + ' = '
      + this.quote(to);
  }
}

export default Join