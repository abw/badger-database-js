import Builder from '../Builder.js';
import { blank, equals, FULL_JOIN, INNER_JOIN, JOIN, LEFT_JOIN, newline, AS, ON, RIGHT_JOIN } from '../Constants.js';
import { spaceAfter, spaceAround } from '../Utils/Space.js';

const tableColumnRegex = /^(\w+)\.(\w+)$/;
const joinRegex = /^(.*?)\s*(<?=>?)\s*(\w+)\.(\w+)(?:\s+as\s+(\w+))?$/;
const joinElements = {
  from:  1,
  type:  2,
  table: 3,
  to:    4,
  as:    5,
};
const joinTypes = {
  default: JOIN,
  inner:   INNER_JOIN,
  '=':     JOIN,
  left:    LEFT_JOIN,
  '<=':    LEFT_JOIN,
  right:   RIGHT_JOIN,
  '=>':    RIGHT_JOIN,
  full:    FULL_JOIN,
  '<=>':   FULL_JOIN,
};

export class Join extends Builder {
  static buildMethod = 'join'
  static buildOrder  = 40
  static keyword     = blank
  static joint       = newline
  static messages    = {
    type:   'Invalid join type "<joinType>" specified for query builder "<method>" component.  Valid types are "left", "right", "inner" and "full".',
    string: 'Invalid join string "<join>" specified for query builder "<method>" component.  Expected "from=table.to".',
    object: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "type", "table", "from" and "to".',
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [type, from, table, to], [from, table, to] or [from, table.to].',
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
      return join.as
        ? this.constructJoinAs(
          type, join.from, join.table, join.as, this.tableColumn(join.as, join.to)
        )
        : this.constructJoin(
          type, join.from, join.table, this.tableColumn(join.table, join.to)
        );
    }
    else if (join.from && join.to) {
      const match = join.to.match(tableColumnRegex);
      if (match) {
        return join.as
          ? this.constructJoinAs(
            type, join.from, match[1], join.as, this.tableColumn(join.as, match[2])
          )
          : this.constructJoin(
            type, join.from, match[1], this.tableColumn(match[1], match[2])
          )
      }
    }
    this.errorMsg('object', { keys: Object.keys(join).sort().join(', ') });
  }

  constructJoin(type, from, table, to) {
    return spaceAfter(type)
      + this.quote(table)
      + spaceAround(ON)
      + this.quote(from)
      + spaceAround(equals)
      + this.quote(to);
  }
  constructJoinAs(type, from, table, as, to) {
    return spaceAfter(type)
      + this.quote(table)
      + spaceAround(AS)
      + this.quote(as)
      + spaceAround(ON)
      + this.quote(from)
      + spaceAround(equals)
      + this.quote(to);
  }
}

export default Join