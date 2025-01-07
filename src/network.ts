class Network {
	constructor(
		private readonly baseApiUrl: string,
		private readonly trackingApiKey: string,
	) {}

	async send(
		path: `/${string}`,
		method: string,
		body: Record<string, unknown>,
	) {
		const url = new URL(`${this.baseApiUrl}${path}`);
		url.searchParams.set('tracking_api_key', this.trackingApiKey);
		const headers = new Headers({
			Accept: 'application/json',
			'Content-Type': 'application/json',
		});

		const response = await fetch(url, {
			method,
			headers,
			keepalive: true,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(
				`Unable to make the request - server returned ${response.statusText} ${response.status}, expected 2xx`,
			);
		}
	}
}

export default Network;
