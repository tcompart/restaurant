module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  testResultsProcessor: "jest-junit",
  coverageReporters: ["json"],
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageDirectory: 'coverage'
};