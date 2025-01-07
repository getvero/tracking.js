import LocalStorageMock from '../test/local-storage-mock';
import {
	LegacySessionCookieSiteVisitedStore,
	SessionStorageSiteVisitedStore,
} from './site-visited-store';
import isBrowser from './utils/isBrowser';

jest.mock('./utils/isBrowser');

describe('TESTING SessionStorageSiteVisitedStore', () => {
	let sessionStorageSiteVisitedStore: SessionStorageSiteVisitedStore;

	beforeEach(() => {
		Object.defineProperty(global, 'sessionStorage', {
			value: new LocalStorageMock(),
			writable: true,
		});
		sessionStorageSiteVisitedStore = new SessionStorageSiteVisitedStore({
			keyNamespace: 'test',
		});
	});

	afterEach(() => {
		Object.defineProperty(global, 'sessionStorage', {
			value: undefined,
			writable: true,
		});
	});

	describe('WHEN setVisited is called', () => {
		beforeEach(() => {
			sessionStorageSiteVisitedStore.setVisited('1');
		});

		it('SHOULD save the visited status to sessionStorage', () => {
			expect(
				sessionStorage.getItem('test:__vero_tracking_site_visited:1'),
			).toBe('true');
		});
	});

	describe('WHEN hasVisited is called', () => {
		it('SHOULD return true if the user has visited', () => {
			sessionStorage.setItem('test:__vero_tracking_site_visited:1', 'true');
			expect(sessionStorageSiteVisitedStore.hasVisited('1')).toBe(true);
		});

		it('SHOULD return false if the user has not visited', () => {
			sessionStorage.removeItem('test:__vero_tracking_site_visited:1');
			expect(sessionStorageSiteVisitedStore.hasVisited('1')).toBe(false);
		});
	});

	describe('WHEN clear is called', () => {
		beforeEach(() => {
			sessionStorage.setItem('test:__vero_tracking_site_visited:1', 'true');
			sessionStorageSiteVisitedStore.clear('1');
		});

		it('SHOULD remove the visited status from sessionStorage', () => {
			expect(
				sessionStorage.getItem('test:__vero_tracking_site_visited:1'),
			).toBeNull();
		});
	});
});

describe('TESTING LegacySessionCookieSiteVisitedStore', () => {
	let legacySessionCookieSiteVisitedStore: LegacySessionCookieSiteVisitedStore;

	beforeEach(() => {
		Object.defineProperty(global, 'document', {
			value: {
				cookie: '',
			},
			writable: true,
		});
		legacySessionCookieSiteVisitedStore =
			new LegacySessionCookieSiteVisitedStore({});
	});

	describe('WHEN setVisited is called', () => {
		beforeEach(() => {
			legacySessionCookieSiteVisitedStore.setVisited();
		});

		it('SHOULD save the visited status to cookies', () => {
			expect(document.cookie).toContain('__vero_visit=true');
		});
	});

	describe('WHEN hasVisited is called', () => {
		it('SHOULD return true if the user has visited', () => {
			document.cookie = '__vero_visit=true';
			expect(legacySessionCookieSiteVisitedStore.hasVisited()).toBe(true);
		});

		it('SHOULD return false if the user has not visited', () => {
			document.cookie = '';
			expect(legacySessionCookieSiteVisitedStore.hasVisited()).toBe(false);
		});
	});

	describe('WHEN clear is called', () => {
		beforeEach(() => {
			legacySessionCookieSiteVisitedStore.clear();
		});

		it('SHOULD remove the visited status from cookies', () => {
			expect(document.cookie).toContain(
				'__vero_visit=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
			);
		});
	});
});
