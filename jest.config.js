/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};
