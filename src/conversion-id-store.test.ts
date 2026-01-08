import LocalStorageMock from '../test/local-storage-mock';
import {
	LegacySessionCookieConversionIdStore,
	SessionStorageConversionIdStore,
} from './conversion-id-store';
import * as getVeroConvParamModule from './utils/getVeroConvParam';

jest.mock('./utils/isBrowser');
jest.mock('./utils/getVeroConvParam');

describe('TESTING SessionStorageConversionIdStore', () => {
	let sessionStorageConversionIdStore: SessionStorageConversionIdStore;

	beforeEach(() => {
		Object.defineProperty(global, 'sessionStorage', {
			value: new LocalStorageMock(),
			writable: true,
		});
		jest.spyOn(getVeroConvParamModule, 'default').mockReturnValue(null);
	});

	afterEach(() => {
		Object.defineProperty(global, 'sessionStorage', {
			value: undefined,
			writable: true,
		});
		jest.clearAllMocks();
	});

	describe('WHEN constructor is called with vero_conv in URL', () => {
		beforeEach(() => {
			jest
				.mocked(getVeroConvParamModule.default)
				.mockReturnValue('test-conversion-id');
			sessionStorageConversionIdStore = new SessionStorageConversionIdStore({
				keyNamespace: 'test',
			});
		});

		it('SHOULD extract and store the conversion ID to sessionStorage', () => {
			expect(sessionStorage.getItem('test:__vero_conv')).toBe(
				'test-conversion-id',
			);
		});
	});

	describe('WHEN constructor is called without vero_conv in URL', () => {
		beforeEach(() => {
			jest.mocked(getVeroConvParamModule.default).mockReturnValue(null);
			sessionStorageConversionIdStore = new SessionStorageConversionIdStore({
				keyNamespace: 'test',
			});
		});

		it('SHOULD not store anything to sessionStorage', () => {
			expect(sessionStorage.getItem('test:__vero_conv')).toBeNull();
		});
	});

	describe('WHEN get is called', () => {
		beforeEach(() => {
			sessionStorageConversionIdStore = new SessionStorageConversionIdStore({
				keyNamespace: 'test',
			});
		});

		it('SHOULD return the conversion ID if it exists', () => {
			sessionStorage.setItem('test:__vero_conv', 'stored-conversion-id');
			expect(sessionStorageConversionIdStore.get()).toBe(
				'stored-conversion-id',
			);
		});

		it('SHOULD return undefined if no conversion ID is stored', () => {
			sessionStorage.removeItem('test:__vero_conv');
			expect(sessionStorageConversionIdStore.get()).toBeUndefined();
		});
	});
});

describe('TESTING LegacySessionCookieConversionIdStore', () => {
	let legacySessionCookieConversionIdStore: LegacySessionCookieConversionIdStore;

	beforeEach(() => {
		Object.defineProperty(global, 'document', {
			value: {
				cookie: '',
			},
			writable: true,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('WHEN constructor is called with vero_conv in URL', () => {
		beforeEach(() => {
			jest
				.mocked(getVeroConvParamModule.default)
				.mockReturnValue('test-conversion-id');
			legacySessionCookieConversionIdStore =
				new LegacySessionCookieConversionIdStore({});
		});

		it('SHOULD extract and store the conversion ID to cookies', () => {
			expect(document.cookie).toContain('__vero_conv=test-conversion-id');
		});
	});

	describe('WHEN constructor is called with vero_conv in URL and cookieDomain option', () => {
		beforeEach(() => {
			jest
				.mocked(getVeroConvParamModule.default)
				.mockReturnValue('test-conversion-id');
			legacySessionCookieConversionIdStore =
				new LegacySessionCookieConversionIdStore({
					cookieDomain: 'example.com',
				});
		});

		it('SHOULD store the conversion ID with domain in cookies', () => {
			expect(document.cookie).toContain('__vero_conv=test-conversion-id');
			expect(document.cookie).toContain('domain=.example.com');
		});
	});

	describe('WHEN constructor is called without vero_conv in URL', () => {
		beforeEach(() => {
			jest.mocked(getVeroConvParamModule.default).mockReturnValue(null);
			legacySessionCookieConversionIdStore =
				new LegacySessionCookieConversionIdStore();
		});

		it('SHOULD not store anything to cookies', () => {
			expect(document.cookie).toBe('');
		});
	});

	describe('WHEN get is called', () => {
		beforeEach(() => {
			legacySessionCookieConversionIdStore =
				new LegacySessionCookieConversionIdStore();
		});

		it('SHOULD return the conversion ID if it exists in cookies', () => {
			document.cookie = '__vero_conv=stored-conversion-id';
			expect(legacySessionCookieConversionIdStore.get()).toBe(
				'stored-conversion-id',
			);
		});

		it('SHOULD return undefined if no conversion ID cookie exists', () => {
			document.cookie = '';
			expect(legacySessionCookieConversionIdStore.get()).toBeUndefined();
		});

		it('SHOULD return undefined if conversion ID cookie has empty value', () => {
			document.cookie = '__vero_conv=';
			expect(legacySessionCookieConversionIdStore.get()).toBeUndefined();
		});

		it('SHOULD return the correct value when multiple cookies exist', () => {
			document.cookie =
				'other_cookie=value; __vero_conv=my-conv-id; another=test';
			expect(legacySessionCookieConversionIdStore.get()).toBe('my-conv-id');
		});
	});
});
