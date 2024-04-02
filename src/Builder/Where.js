import Builder from '../Builder.js';
import { hasValue, isArray, isNull, splitList } from '@abw/badger-utils';
import { AND, WHERE, space } from '../Constants.js';
import { isIn, toArray } from '../Utils/index.js'

export class Where extends Builder {
  static buildMethod = 'where'
  static buildOrder  = 50
  static keyword     = WHERE
  static joint       = space + AND + space
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
        const inOrNotIn = isIn(criteria[1][0])
        if (inOrNotIn) {
          const inValues = toArray(criteria[1][1])
          this.addValues(...inValues);
          return this.resolveIn(criteria[0], inOrNotIn, inValues)
        }
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
      // a three-element array is [column, operator, value]
      const inOrNotIn = isIn(criteria[1])
      if (inOrNotIn) {
        const inValues = toArray(criteria[2])
        this.addValues(...inValues);
        return this.resolveIn(criteria[0], inOrNotIn, inValues)
      }
      if (hasValue(criteria[2])) {
        this.addValues(criteria[2]);
      }
      return database.engine.formatWherePlaceholder(
        criteria[0],
        [criteria[1], criteria[2]],
        this.context.placeholder++
      )
    }
    else {
      this.errorMsg('array', { n: criteria.length });
    }
  }

  resolveLinkObject(criteria) {
    const database = this.lookupDatabase();
    let values = [ ];
    const result = Object.entries(criteria).map(
      ([column, value]) => {
        if (isArray(value)) {
          // the value can be a two element array: [operator, value]
          // or a single element array: [operator]
          if (value.length === 2) {
            const inOrNotIn = isIn(value[0])
            const inValues = toArray(value[1])
            if (inOrNotIn) {
              values.push(...inValues)
              return this.resolveIn(column, inOrNotIn, inValues)
            }
            values.push(value[1])
          }
          else if (value.length !== 1) {
            this.errorMsg('object', { n: value.length });
          }
        }
        else if (isNull(value)) {
          // special case where value is null: WHERE xxx is null
          return database.engine.formatWhereNull(
            column
          )
        }
        else {
          // otherwise we assume it's just a value
          // console.log(`adding value for ${column}: `, value);
          values.push(value)
        }
        // generate the criteria with a placeholder
        return database.engine.formatWherePlaceholder(
          column,
          value,
          this.context.placeholder++
        )
      }
    )
    if (values.length) {
      this.addValues(...values);
    }
    return result;
  }

  resolveIn(column, operator, values) {
    const database = this.lookupDatabase();
    // console.log(`adding ${column} ${operator} values: `, values);
    const ph = this.context.placeholder
    this.context.placeholder += values.length
    return database.engine.formatWhereInPlaceholder(
      column,
      operator,
      values,
      ph
    )
  }

  addValues(...values) {
    // Subclasses Having.js and Set.js redefine this to save the values
    // in different lists (havingValues() and setValues() respectively)
    this.whereValues(...values)
  }
}

export default Where