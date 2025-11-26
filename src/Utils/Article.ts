export const article = (noun: string) =>
  noun.match(/^[aeiou]/i)
    ? 'an'
    : 'a'
