import isBrowser from './utils/isBrowser';

export interface IdentityStore {
	save(userId: string, email: string): void;
	get(): { userId: string; email: string } | undefined;
	clear(): void;
}

interface LocalStorageIdentityStoreOptions {
	keyNamespace: string;
}

export class LocalStorageIdentityStore implements IdentityStore {
	private readonly userIdKey: string;
	private readonly emailKey: string;

	constructor(options: LocalStorageIdentityStoreOptions) {
		this.userIdKey = `${options.keyNamespace}:__vero_tracking_user_id`;
		this.emailKey = `${options.keyNamespace}:__vero_tracking_email`;
		if (!isBrowser() || typeof localStorage === 'undefined') {
			throw new Error(
				'localStorage is not available (is this a browser environment?)',
			);
		}
	}

	save(userId: string, email: string) {
		localStorage.setItem(this.userIdKey, userId);
		localStorage.setItem(this.emailKey, email);
	}

	get() {
		const userId = localStorage.getItem(this.userIdKey);
		const email = localStorage.getItem(this.emailKey);

		if (userId && email) {
			return { userId, email };
		}
	}

	clear() {
		localStorage.removeItem(this.userIdKey);
		localStorage.removeItem(this.emailKey);
	}
}
