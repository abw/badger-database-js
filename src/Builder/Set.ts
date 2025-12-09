import Where, { WhereColumnObject } from './Where'
import { comma, SET } from '../Constants'

export type SetColumn = string | string[] | SetColumnObject
export type SetColumnObject = WhereColumnObject

export class Set extends Where {
  static buildMethod = 'set'
  static buildOrder  = 45
  static keyword     = SET
  static joint       = comma
  static messages = {
    array:  'Invalid array with <n> items specified for query builder "<method>" component. Expected [column, value].',
    object: 'Invalid value array with <n> items specified for query builder "<method>" component. Expected [value] or [operator, value].',
  }

  // This works in a similar way to Where, EXCEPT for the fact that
  // we save values in a separate list, this.context.setValues.
  addValues(...values: any[]) {
    this.setValues(...values)
  }

  resolveLinkObject(criteria: SetColumnObject) {
    const database = this.lookupDatabase();
    let values = [ ];
    const result = Object.entries(criteria).map(
      ([column, value]) => {
        values.push(value)
        // generate the criteria with a placeholder
        return database.engine.formatWherePlaceholder(
          column,
          // the 'value' here can be a JSON array which confuses the
          // formatWherePlaceholder() method into thinking it's a comparison
          // which is valid in where() but not in set()
          '',
          this.context.placeholder++
        )
      }
    )
    if (values.length) {
      this.addValues(...values);
    }
    return result;
  }

  resolveLinkArray(criteria: [string, any]) {
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