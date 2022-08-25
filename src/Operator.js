// work in progress / experiment

import { addDebug } from "@abw/badger";

export class Operator {
  constructor(factory, parent, args) {
    this.factory = factory;
    this.parent = parent;
    this.args = args;
    this.initOperator(args);
    addDebug(this, true, 'Operator > ', 'red');
    this.debug("parent: ", parent);
  }
  initOperator() {
    // stub for subclasses
  }
  dump() {
    return undefined;
  }
  select(columns) {
    this.debug("+select")
    return this.factory(this, 'select', columns);
  }
  from(table) {
    this.debug("+from")
    return this.factory(this, 'from', table);
  }
  where(condition) {
    this.debug("+where")
    return this.factory(this, 'where', condition);
  }
  dumpChain() {
    return this.parent
      ? this.parent.dumpChain() + "\n" + this.dump()
      : '';
  }
}

export default Operator