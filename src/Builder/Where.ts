import Builder from '../Builder'
import { isInOrNotIn, toArray } from '../Utils'
import { AND, WHERE, IN, NOT_IN, space } from '../Constants'
import { hasValue, isArray, isNull, isObject, isString, joinListAnd, splitList } from '@abw/badger-utils'

export type WhereColumn = string | string[] | WhereColumnObject
export type WhereColumnName = any
export type WhereColumnComparison =
    [string, string, any?]                // ['added_on', '<'] or ['added_on', '<', '2025']
  | [string, [string, any?]]              // ['added_on', ['<']] or ['added_on', ['<', '2025']]
  | [string, 'in' | 'not in', any[]]      // ['status', 'in', ['pending', 'active']]
  | [string, ['in' | 'not in', any[]]]    // ['status', ['in', ['pending', 'active']]]

export type WhereColumnValue = WhereColumnName | WhereColumnComparison
export type WhereColumnObject = Record<string, WhereColumnValue>

export class Where extends Builder {
  static buildMethod = 'where'
  static buildOrder  = 50
  static keyword     = WHERE
  static joint       = space + AND + space
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, value] or [column, operator, value].',
    object: 'Invalid value array with <n> items specified for query builder "<method>" component. Expected [value] or [operator, value].',
    comparator: 'Invalid comparator object with <keys> specified for query builder "<method>" component. Expected object to contain "isNull", "notNull", etc.',
  }

  resolveLinkString(columns: string) {
    const database = this.lookupDatabase()
    // split columns into a list and generate criteria with placeholders
    return splitList(columns).map(
      column => database.engine.formatWherePlaceholder(
        column as string,
        undefined,
        this.context.placeholder++
      )
    )
  }

  resolveLinkArray(criteria: string[]) {
    const database = this.lookupDatabase();
    if (criteria.length === 2) {
      let match: RegExpMatchArray

      if (isArray(criteria[1])) {
        // a two-element array can be [column, [operator]] or [column, [operator, value]]
        const inOrNotIn = isInOrNotIn(criteria[1][0])
        if (inOrNotIn) {
          const inValues = toArray(criteria[1][1])
          // this.addValues(...inValues);
          return this.resolveIn(criteria[0], inOrNotIn, inValues)
        }
        if (hasValue(criteria[1][1])) {
          this.addValues(criteria[1][1]);
        }
        match = [criteria[1][0], undefined];
      }
      else if (isObject(criteria[1])) {
        return this.resolveLinkObjectValue(criteria[0], criteria[1])
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
      const inOrNotIn = isInOrNotIn(criteria[1])
      if (inOrNotIn) {
        const inValues = toArray(criteria[2])
        // Moved into resolveIn()
        // this.addValues(...inValues);
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

  resolveLinkObject(criteria: WhereColumnObject) {
    const database = this.lookupDatabase();
    let values = [ ];
    const result = Object.entries(criteria).map(
      ([column, value]) => {
        if (isArray(value)) {
          // the value can be a two element array: [operator, value]
          // or a single element array: [operator]
          if (value.length === 2) {
            const inOrNotIn = isString(value[0]) && isInOrNotIn(value[0])
            if (inOrNotIn) {
              const inValues = toArray(value[1])
              // Hmmm... is there some reasons why I didn't just call
              // addValues() here?  This has now been moved into resolveIn()
              // values.push(...inValues)
              return this.resolveIn(column, inOrNotIn, inValues)
            }
            // Keeping this here just to remind me of what might be breakage!
            // values.push(value[1])
            this.addValues(value[1])
          }
          else if (value.length !== 1) {
            this.errorMsg('object', { n: value.length });
          }
        }
        else if (isObject(value)) {
          return this.resolveLinkObjectValue(column, value)
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
          // See notes above - might have broken something here
          // values.push(value)
          this.addValues(value)
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
      // See notes above - might have broken something here
      // this.addValues(...values);
    }
    return result;
  }

  resolveLinkObjectValue(column, object) {
    // special case for comparators like { isNull: true }, { isNotNull: true },
    // { isIn: [...] }, { notIn: [...] } and perhaps others one day...
    const database = this.lookupDatabase();

    if (object.isNull) {
      return database.engine.formatWhereNull(
        column
      )
    }
    else if (object.notNull) {
      return database.engine.formatWhereNotNull(
        column
      )
    }
    else if (object.isIn) {
      return this.resolveIn(
        column, IN, object.isIn
      )
    }
    else if (object.notIn) {
      return this.resolveIn(
        column, NOT_IN, object.notIn
      )
    }
    else {
      const ks = Object.keys(object)
      const keys = joinListAnd( ks.map( k => `"${k}"` ) )
        + (ks.length > 1 ? ' keys' : ' key')

      this.errorMsg( 'comparator',  { keys })
    }
  }

  resolveIn(column: string, operator: string, values: any[]) {
    const database = this.lookupDatabase();
    console.log(`adding ${column} ${operator} values: `, values);
    const ph = this.context.placeholder
    this.context.placeholder += values.length
    this.addValues(...values)
    return database.engine.formatWhereInPlaceholder(
      column,
      operator,
      values,
      ph
    )
  }

  addValues(...values: any[]) {
    // Subclasses Having.js and Set.js redefine this to save the values
    // in different lists (havingValues() and setValues() respectively)
    this.whereValues(...values)
  }
}

export default Where