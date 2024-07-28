import { expect } from 'vitest'

export const expectToThrowErrorTypeMessage = (fn, ErrorType, ErrorMessage) => {
  expect(fn).toThrowError(ErrorType)
  expect(fn).toThrowError(ErrorMessage)
}

export const expectToThrowAsyncErrorTypeMessage = async (fn, ErrorType, ErrorMessage) => {
  await expect(fn).rejects.toThrowError(ErrorType)
  await expect(fn).rejects.toThrowError(ErrorMessage)
}

export const expectOpTypeSql = (op, type, sql) => {
  expect(op).toBeInstanceOf(type)
  expect(op.sql()).toBe(sql)
}

export const pass = () =>
  expect(true).toBeTruthy()