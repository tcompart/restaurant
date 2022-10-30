module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '(/src/.*\\.(test|spec)?\\.(ts|tsx)$|app.test.js)',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};