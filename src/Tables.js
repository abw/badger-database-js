export class Tables {
  constructor(tables={}) {
    this.tables = tables;
  }
  table(name) {
    return this.tables[name];
  }
}

export default Tables;