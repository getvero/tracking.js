import isBrowser from './utils/isBrowser';

export interface SiteVisitedStore {
	hasVisited(userId: string): boolean;
	setVisited(userId: string): void;
	clear(userId: string): void;
}

interface SessionStorageSiteVisitedStoreOptions {
	keyNamespace: string;
}

export class SessionStorageSiteVisitedStore implements SiteVisitedStore {
	private readonly keyNamespace: string;

	constructor(options: SessionStorageSiteVisitedStoreOptions) {
		if (!isBrowser() || typeof sessionStorage === 'undefined') {
			throw new Error(
				'sessionStorage is not available (is this a browser environment?)',
			);
		}
		this.keyNamespace = options.keyNamespace;
	}

	hasVisited(userId: string) {
		return (
			sessionStorage.getItem(
				`${this.keyNamespace}:__vero_tracking_site_visited:${userId}`,
			) === 'true'
		);
	}

	setVisited(userId: string) {
		sessionStorage.setItem(
			`${this.keyNamespace}:__vero_tracking_site_visited:${userId}`,
			'true',
		);
	}

	clear(userId: string) {
		sessionStorage.removeItem(
			`${this.keyNamespace}:__vero_tracking_site_visited:${userId}`,
		);
	}
}

interface LegacySessionCookieSiteVisitedStoreOptions {
	cookieDomain?: string;
}

export class LegacySessionCookieSiteVisitedStore implements SiteVisitedStore {
	private static readonly COOKIE_NAME = '__vero_visit';
	private readonly cookieDomain?: string;

	constructor(options: LegacySessionCookieSiteVisitedStoreOptions) {
		if (!isBrowser()) {
			throw new Error(
				'Creating SessionCookieSiteVisitedStore in an invalid environment (is this a browser environment?)',
			);
		}
		this.cookieDomain = options.cookieDomain;
	}

	hasVisited() {
		return document.cookie
			.split(';')
			.some((cookie) =>
				cookie.includes(
					`${LegacySessionCookieSiteVisitedStore.COOKIE_NAME}=true`,
				),
			);
	}

	setVisited() {
		let cookieString = `${LegacySessionCookieSiteVisitedStore.COOKIE_NAME}=true; path=/`;
		if (this.cookieDomain) {
			cookieString += `; domain=.${this.cookieDomain}`;
		}
		document.cookie = cookieString;
	}

	clear() {
		let cookieString = `${LegacySessionCookieSiteVisitedStore.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
		if (this.cookieDomain) {
			cookieString += `; domain=.${this.cookieDomain}`;
		}
		document.cookie = cookieString;
	}
}
