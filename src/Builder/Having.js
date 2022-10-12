import Where from './Where.js';

export class Having extends Where {
  initBuilder() {
    super.initBuilder();
    this.key = 'having';
  }

  // Everything works the same as for Where, EXCEPT for the fact that we save
  // values in a separate list.  Any where() values go in this.context.values,
  // and having() values go in this.context.havingValues so that we can make
  // sure that these values are always provided at the end of the query.
  // e.g. db.select(...).where({a:10}).having({c:30}).where({b:20}) will
  // generate a query like 'SELECT ... WHERE a=? AND b=? ... HAVING c=?'.
  // The where() values for a and b (10, 20) must come before the having()
  // value for b (30)
  addValues(...values) {
    this.context.havingValues.push(...values)
  }
}

export default Having