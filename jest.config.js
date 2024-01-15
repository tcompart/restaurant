module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  testResultsProcessor: "jest-junit",
  coverageReporters: ["text-summary", "lcov", "cobertura", "json"],
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageDirectory: 'coverage'
};