import Where from './Where.js';
import { comma, SET } from '../Constants.js';

export class Set extends Where {
  static buildMethod = 'set'
  static buildOrder  = 45
  static keyword     = SET
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, value].',
    object: 'Invalid value array with <n> items specified for query builder "<method>" component. Expected [value] or [operator, value].',
  }

  // Everything works the same as for Where, EXCEPT for the fact that we save
  // values in a separate list, this.context.setValues.
  addValues(...values) {
    this.setValues(...values)
  }
  resolveLinkArray(criteria) {
    // don't allow three arguments - comparisons are not valid here
    if (criteria.length == 2) {
      this.addValues(criteria[1]);
      return this.lookupDatabase().engine
        .formatSetPlaceholder(
          criteria[0],
          this.context.placeholder++
        )
    }
    else {
      this.errorMsg('array', { n: criteria.length });
    }
  }
}

export default Set