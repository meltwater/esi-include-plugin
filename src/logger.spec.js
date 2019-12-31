const logger = require('./logger');

test('is a singleton', () => {
  const first = new logger();
  const second = new logger();
  expect(first).toEqual(second);
});