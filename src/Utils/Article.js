// TODO: move this into badger-utils
export const article = noun =>
  noun.match(/^[aeiou]/i)
    ? 'an'
    : 'a'
