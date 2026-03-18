module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    // Stub out expo's native winter runtime — it references global.FormData
    // which doesn't exist in Node and isn't needed for Jest tests.
    '^expo/src/winter$': '<rootDir>/jest-mocks/expo-winter-runtime.js',
    '^expo/src/winter/runtime(\\.native)?$': '<rootDir>/jest-mocks/expo-winter-runtime.js',
    // MSW v2 uses package exports; Jest needs explicit CJS path for msw/node.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.js',
  },
  setupFiles: ['./jest.setup.polyfills.js'],
  testPathIgnorePatterns: ['/node_modules/', 'mocks/server.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-ng/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|msw|@mswjs|until-async)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
