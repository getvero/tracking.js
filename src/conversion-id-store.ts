import getVeroConvParam from './utils/getVeroConvParam';
import isBrowser from './utils/isBrowser';
import normalizeCookieDomainForSubdomains from './utils/normalizeCookieDomainForSubdomains';

export interface ConversionIdStore {
	get(): string | undefined;
}

interface SessionStorageConversionIdStoreOptions {
	keyNamespace: string;
}

export class SessionStorageConversionIdStore implements ConversionIdStore {
	private readonly key: string;

	constructor(options: SessionStorageConversionIdStoreOptions) {
		if (!isBrowser() || typeof sessionStorage === 'undefined') {
			throw new Error(
				'sessionStorage is not available (is this a browser environment?)',
			);
		}
		this.key = `${options.keyNamespace}:__vero_conv`;
		this.extractAndStoreFromUrl();
	}

	get(): string | undefined {
		return sessionStorage.getItem(this.key) ?? undefined;
	}

	private extractAndStoreFromUrl(): void {
		const veroConv = getVeroConvParam();
		if (veroConv) {
			sessionStorage.setItem(this.key, veroConv);
		}
	}
}

interface LegacySessionCookieConversionIdStoreOptions {
	cookieDomain?: string;
}

export class LegacySessionCookieConversionIdStore implements ConversionIdStore {
	private static readonly COOKIE_NAME = '__vero_conv';
	private readonly cookieDomain?: string;

	constructor(options: LegacySessionCookieConversionIdStoreOptions = {}) {
		if (!isBrowser()) {
			throw new Error(
				'Creating LegacySessionCookieConversionIdStore in an invalid environment (is this a browser environment?)',
			);
		}
		this.cookieDomain = options.cookieDomain
			? normalizeCookieDomainForSubdomains(options.cookieDomain)
			: undefined;
		this.extractAndStoreFromUrl();
	}

	get(): string | undefined {
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const [name, ...valueParts] = cookie.trim().split('=');
			const value = valueParts.join('=');
			if (name === LegacySessionCookieConversionIdStore.COOKIE_NAME) {
				let decodedValue: string;
				try {
					decodedValue = decodeURIComponent(value);
				} catch {
					decodedValue = value;
				}

				return decodedValue || undefined;
			}
		}
		return undefined;
	}

	private extractAndStoreFromUrl(): void {
		const veroConv = getVeroConvParam();
		if (veroConv) {
			let cookieString = `${LegacySessionCookieConversionIdStore.COOKIE_NAME}=${encodeURIComponent(veroConv)}; path=/`;
			if (this.cookieDomain) {
				cookieString += `; domain=${this.cookieDomain}`;
			}
			document.cookie = cookieString;
		}
	}
}
