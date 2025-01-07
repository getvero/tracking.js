import fetchMock from '@fetch-mock/jest';
import Network from './network';

describe('TESTING Network', () => {
	let network: Network;

	beforeEach(() => {
		network = new Network('https://api.getvero.com/api/v2', 'test-api-key');
		fetchMock
			.mockGlobal()
			.postOnce(
				'https://api.getvero.com/api/v2/foo?tracking_api_key=test-api-key',
				200,
				{
					response: {
						status: 200,
						message: 'Success.',
					},
					name: 'foo',
				},
			);
	});

	afterEach(() => {
		fetchMock.mockReset().unmockGlobal();
	});

	describe('WHEN send is called', () => {
		beforeEach(async () => {
			await network.send('/foo', 'POST', {
				foo: 'bar',
			});
		});

		it('SHOULD send the fetch request with the correct tracking api key as search param', () => {
			// @ts-ignore toBeDone is not typed: https://github.com/wheresrhys/fetch-mock/pull/892
			expect(fetch).toBeDone('foo');
		});

		it('SHOULD set keeplive of the fetch request to true', () => {
			expect(fetchMock.callHistory.lastCall()?.options.keepalive).toBe(true);
		});
	});
});
