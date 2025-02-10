/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
	branches: ['master'],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'semantic-release-mirror-version',
			{
				fileGlob: './README.md',
				placeholderRegExp: /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/g,
			},
		],
		'@semantic-release/npm',
		[
			'@semantic-release/exec',
			{
				verifyConditionsCmd:
					'echo //npm.pkg.github.com/:_authToken=${process.env.GITHUB_TOKEN} > /tmp/github.npmrc && npm whoami --userconfig /tmp/github.npmrc --registry https://npm.pkg.github.com/',
				publishCmd:
					'npm publish --userconfig /tmp/github.npmrc --registry https://npm.pkg.github.com/ --no-git-tag-version',
				successCmd: 'rm -f /tmp/github.npmrc',
				failCmd: 'rm -f /tmp/github.npmrc',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: [
					'CHANGELOG.md',
					'README.md',
					'package.json',
					'package-lock.json',
					'npm-shrinkwrap.json',
				],
			},
		],
		'@semantic-release/github',
	],
};
