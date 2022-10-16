import Builder from './Builder.js';
import { comma, WITH } from '../Constants.js';

export class With extends Builder {
  static buildMethod = 'with'
  static buildOrder  = 10
  static keyword     = WITH
  static joint       = comma
  static messages    = {
    todo:    'Query builder "<method>" component is TODO',
    array:   'Invalid array with <n> items specified for query builder "<method>" component. Expected [...].',
    object:  'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Valid properties are "xxx".',
    missing: 'Invalid object with "<keys>" properties specified for query builder "<method>" component.  Required "<key>" property is missing.',
  }

  initBuilder() {
    this.errorMsg('todo');
  }

  resolveLinkArray(arg) {
    if (arg.length === 2) {
      return this.resolveLinkObject({
        with: arg[0],
        as:   arg[1]
      })
    }
    else if (arg.length === 3) {
      return this.resolveLinkObject({
        with: arg[0],
        as:   arg[1]
      })
    }
    this.errorMsg('array', { n: arg.length });
  }

  resolveLinkObject(arg) {
    // const keys = Object.keys(arg).sort().join(', ');
    // const name = arg.with || this.errorMsg('missing', { key: 'with', keys })
    // const as   = arg.as   || this.errorMsg('missing', { key: 'with', keys })
    // const cols = arg.columns;
    this.errorMsg('object', { keys: Object.keys(arg).sort().join(', ') });
  }
}

export default With

