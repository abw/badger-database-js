export class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnexpectedRowCount extends CustomError { }

export function unexpectedRowCount(n) {
  throw new UnexpectedRowCount(`${n} rows were returned when one was expected`)
}
