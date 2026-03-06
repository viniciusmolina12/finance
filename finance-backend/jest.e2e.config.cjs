/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.e2e.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2022",
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          types: ["node", "jest"],
        },
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^#shared/(.*)\\.js$": "<rootDir>/src/core/shared/$1",
    "^#user/(.*)\\.js$": "<rootDir>/src/core/user/$1",
    "^#category/(.*)\\.js$": "<rootDir>/src/core/category/$1",
    "^#bill/(.*)\\.js$": "<rootDir>/src/core/bill/$1",
    "^#presentation/(.*)\\.js$": "<rootDir>/src/presentation/$1",
  },
};
