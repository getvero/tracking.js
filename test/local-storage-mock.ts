// Copied from https://github.com/shinshin86/local-storage-mock/blob/daf18dc86bbb5217a5d77257244a68edfa774eb5/src/index.ts

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Store = any;

class LocalStorageMock {
	store: Store;
	length: number;

	constructor() {
		this.store = {};
		this.length = 0;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	key(n: number): any {
		if (typeof n === 'undefined') {
			throw new Error(
				"Uncaught TypeError: Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.",
			);
		}

		if (n >= Object.keys(this.store).length) {
			return null;
		}

		return Object.keys(this.store)[n];
	}

	getItem(key: string): Store | null {
		if (!Object.keys(this.store).includes(key)) {
			return null;
		}

		return this.store[key];
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	setItem(key: string, value: any): undefined {
		if (typeof key === 'undefined' && typeof value === 'undefined') {
			throw new Error(
				"Uncaught TypeError: Failed to execute 'setItem' on 'Storage': 2 arguments required, but only 0 present.",
			);
		}

		if (typeof value === 'undefined') {
			throw new Error(
				"Uncaught TypeError: Failed to execute 'setItem' on 'Storage': 2 arguments required, but only 1 present.",
			);
		}

		if (!key) return undefined;

		this.store[key] = value.toString() || '';
		this.length = Object.keys(this.store).length;

		return undefined;
	}

	removeItem(key: string): undefined {
		if (typeof key === 'undefined') {
			throw new Error(
				"Uncaught TypeError: Failed to execute 'removeItem' on 'Storage': 1 argument required, but only 0 present.",
			);
		}

		delete this.store[key];
		this.length = Object.keys(this.store).length;
		return undefined;
	}

	clear(): undefined {
		this.store = {};
		this.length = 0;

		return undefined;
	}
}

export default LocalStorageMock;
