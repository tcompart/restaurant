module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '(/src/.*\\.(test|spec)?\\.(ts|tsx)$|app.test.js)',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testResultsProcessor: "jest-sonar-reporter",
  coverageReporters: ['clover', 'json', 'lcov', ['text', {skipFull: true}]],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  coverageDirectory: 'coverage'
};