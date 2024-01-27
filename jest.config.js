module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  collectCoverageFrom: ["src/**/*.ts", "src/**/*.js", "!src/**/*.test.*"],
  testResultsProcessor: "jest-junit",
  coverageReporters: ["json"],
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageDirectory: 'coverage'
};