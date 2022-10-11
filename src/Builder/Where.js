import Builder from '../Builder.js';
import { isArray, splitList } from '@abw/badger-utils';
import { QueryBuilderError, thrower } from '../Utils/Error.js';

export const throwWhereError = thrower(
  {
    array:  'Invalid array with <n> items specified for query builder "where" component. Expected [column, value] or [column, operator, value].',
    object: 'Invalid value array with <n> items specified for query builder "where" component. Expected [value] or [operator, value].',
  },
  QueryBuilderError
)

export class Where extends Builder {
  initBuilder() {
    this.key = 'where';
  }

  // TODO: check that placeholders are being counted correctly
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
      // a two-element array is [column, value]
      this.addValues(criteria[1]);
      return database.engine.formatWherePlaceholder(
        criteria[0],
        undefined,
        this.context.placeholder++
      )
    }
    else if (criteria.length === 3) {
      // a two-element array is [column, operator, value]
      this.addValues(criteria[2]);
      return database.engine.formatWherePlaceholder(
        criteria[0],
        [criteria[1], undefined],
        this.context.placeholder++
      )
    }
    else {
      throwWhereError('array', { n: criteria.length });
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
            throwWhereError('object', { n: value.length });
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
}

export default Where