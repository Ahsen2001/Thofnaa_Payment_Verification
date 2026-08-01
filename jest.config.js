/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/app/actions/**/*.ts",
    "!src/**/*.d.ts",
  ],

  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
        },
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  verbose: true,
};

module.exports = config;
