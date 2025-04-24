module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  collectCoverageFrom: ["src/**/*.[j|t]s", "!src/**/*.test.*"],
  transform: {"^.+\\.tsx?$": "ts-jest",},
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testResultsProcessor: "jest-junit",
  coverageReporters: ["json"],
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageDirectory: 'coverage'
};