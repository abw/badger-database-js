import { expect } from 'vitest'

export const expectToThrowErrorTypeMessage = (fn, ErrorType, ErrorMessage) => {
  expect(fn).toThrowError(ErrorType)
  expect(fn).toThrowError(ErrorMessage)
}

export const expectOpTypeSql = (op, type, sql) => {
  expect(op).toBeInstanceOf(type)
  expect(op.sql()).toBe(sql)
}
