import Builder from '../Builder.js';
import { hasValue, isArray, splitList } from '@abw/badger-utils';

export class Where extends Builder {
  static buildMethod = 'where'
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, value] or [column, operator, value].',
    object: 'Invalid value array with <n> items specified for query builder "<method>" component. Expected [value] or [operator, value].',
  }

  resolveLinkString(columns) {
    const database = this.lookupDatabase();
    // split columns into a list and generate criteria with placeholders
    return splitList(columns).map(
      column => database.engine.formatWherePlaceholder(
        column,
        undefined,
        this.context.placeholder++
      )
    )
  }

  resolveLinkArray(criteria) {
    const database = this.lookupDatabase();
    if (criteria.length === 2) {
      let match;
      // a two-element array can be [column, [operator]] or [column, [operator, value]]
      if (isArray(criteria[1])) {
        if (hasValue(criteria[1][1])) {
          this.addValues(criteria[1][1]);
        }
        match = [criteria[1][0], undefined];
      }
      else {
        this.addValues(criteria[1]);
      }
      return database.engine.formatWherePlaceholder(
        criteria[0],
        match,
        this.context.placeholder++
      )
    }
    else if (criteria.length === 3) {
      // a two-element array is [column, operator, value]
      if (hasValue(criteria[2])) {
        this.addValues(criteria[2]);
      }
      return database.engine.formatWherePlaceholder(
        criteria[0],
        [criteria[1], undefined],
        this.context.placeholder++
      )
    }
    else {
      this.errorMsg('array', { n: criteria.length });
    }
  }

  resolveLinkObject(criteria) {
    const database = this.lookupDatabase();
    return Object.entries(criteria).map(
      ([column, value]) => {
        if (isArray(value)) {
          // the value can be a two element array: [operator, value]
          // or a single element array: [operator]
          if (value.length === 2) {
            this.addValues(value[1]);
          }
          else if (value.length !== 1) {
            this.errorMsg('object', { n: value.length });
          }
        }
        else {
          // otherwise we assume it's just a value
          this.addValues(value);
        }
        // generate the criteria with a placeholder
        return database.engine.formatWherePlaceholder(
          column,
          value,
          this.context.placeholder++
        )
      }
    )
  }
  addValues(...values) {
    this.whereValues(...values)
  }
}

export default Where