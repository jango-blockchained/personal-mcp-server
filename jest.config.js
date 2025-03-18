export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	testMatch: ['**/src/**/*.test.ts'],
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/dist/',
		'/coverage/',
		'/src/utils/logger.util.ts',
	],
	coverageReporters: ['text', 'lcov', 'json-summary'],
}
