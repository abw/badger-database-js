import Builder from '../Builder'
import { isFloat, isInteger } from '@abw/badger-utils'

export type ValuesValue = any | any[]

export class Values extends Builder {
  static buildMethod = 'values'
  static buildOrder  = 0

  // values() is used to provide pre-defined values for the INSERT INTO clause.
  // It adds the values to setValues() when the link is resolved but doesn't
  // generate any output - see Into.js for where the VALUES clause is created

  resolveLinkItem(item: any) {
    if (isInteger(item) || isFloat(item)) {
      return this.resolveLinkString(item)
    }
    return super.resolveLinkItem(item)
  }

  resolveLinkString(value: any) {
    this.setValues(value)
    return [];
  }

  resolveLinkArray(values: any[]) {
    values.forEach(
      value => {
        this.setValues(value)
      }
    )
    return [ ];
  }
}

export default Values