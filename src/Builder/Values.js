import { isFloat, isInteger } from '@abw/badger-utils';
import Builder from '../Builder.js';
import { comma, VALUES } from '../Constants.js';
import { parens, spaceAfter } from '../Utils/Space.js';

export class Values extends Builder {
  static buildMethod = 'values'
  static buildOrder  = 45
  static keyword     = VALUES
  static joint       = comma

  static generateSQL(values) {
    const keyword = this.keyword;
    const joint   = this.joint;
    return spaceAfter(keyword)
      + parens(values.join(joint))
  }

  resolveLinkItem(item) {
    if (isInteger(item) || isFloat(item)) {
      return this.resolveLinkString(item);
    }
    return super.resolveLinkItem(item)
  }

  resolveLinkString(value) {
    const database = this.lookupDatabase();
    this.setValues(value)
    return [
      database.engine.formatPlaceholder(
        this.context.placeholder++
      )
    ];
  }

  resolveLinkArray(values) {
    const database = this.lookupDatabase();
    return values.map(
      value => {
        this.setValues(value)
        return database.engine.formatPlaceholder(
          this.context.placeholder++
        )
      }
    )
  }
}

export default Values