import LocalStorageMock from '../test/local-storage-mock';
import { LocalStorageIdentityStore } from './identity-store';

jest.mock('./utils/isBrowser');

describe('TESTING LocalStorageIdentityStore', () => {
	let localStorageIdentityStore: LocalStorageIdentityStore;

	beforeEach(() => {
		Object.defineProperty(global, 'localStorage', {
			value: new LocalStorageMock(),
			writable: true,
		});
		localStorageIdentityStore = new LocalStorageIdentityStore({
			keyNamespace: 'test',
		});
	});

	afterEach(() => {
		Object.defineProperty(global, 'localStorage', {
			value: undefined,
			writable: true,
		});
	});

	describe('WHEN save is called', () => {
		beforeEach(() => {
			localStorageIdentityStore.save('1', 'hello@getvero.com');
		});

		it('SHOULD save the user id and email to localStorage', () => {
			expect(localStorage.getItem('test:__vero_tracking_user_id')).toBe('1');
			expect(localStorage.getItem('test:__vero_tracking_email')).toBe(
				'hello@getvero.com',
			);
		});
	});

	describe('WHEN there is identity in localStorage', () => {
		beforeEach(() => {
			localStorage.setItem('test:__vero_tracking_user_id', '2');
			localStorage.setItem('test:__vero_tracking_email', 'hi@getvero.com');
		});

		describe('WHEN get is called', () => {
			it('SHOULD return the user id and email from localStorage', () => {
				const identity = localStorageIdentityStore.get();
				expect(identity).toEqual({
					userId: '2',
					email: 'hi@getvero.com',
				});
			});
		});

		describe('WHEN clear is called', () => {
			beforeEach(() => {
				localStorageIdentityStore.clear();
			});

			it('SHOULD remove the user id and email from localStorage', () => {
				expect(localStorage.getItem('test:__vero_tracking_user_id')).toBeNull();
				expect(localStorage.getItem('test:__vero_tracking_email')).toBeNull();
			});
		});
	});

	describe('WHEN there is no identity in localStorage', () => {
		describe('WHEN get is called', () => {
			it('SHOULD return undefined', () => {
				const identity = localStorageIdentityStore.get();
				expect(identity).toBeUndefined();
			});
		});

		describe('WHEN clear is called', () => {
			it('SHOULD do nothing and not throw an error', () => {
				expect(() => localStorageIdentityStore.clear()).not.toThrow();
			});
		});
	});
});
