import fetchMock from '@fetch-mock/jest';
import LocalStorageMock from '../test/local-storage-mock';
import type { IdentityStore } from './identity-store';
import Tracker from './tracker';
import * as getDefaultReservedUserDataModule from './utils/getDefaultReservedUserData';
import * as getHostnameModule from './utils/getHostname';
import * as hashStringModule from './utils/hashString';
import * as isBrowserModule from './utils/isBrowser';

jest.mock('./utils/isBrowser');
jest.mock('./utils/getDefaultReservedUserData');
jest.mock('./utils/getHostname');

describe('TESTING Tracker', () => {
	beforeEach(() => {
		fetchMock.mockGlobal().route('*', 200, {
			response: {
				status: 200,
				message: 'Success.',
			},
		});
	});

	afterEach(() => {
		fetchMock.mockReset().unmockGlobal();
	});

	describe('Node environment', () => {
		beforeEach(() => {
			jest.spyOn(isBrowserModule, 'default').mockReturnValue(false);
			jest
				.spyOn(getDefaultReservedUserDataModule, 'default')
				.mockReturnValue({});
			jest.spyOn(getHostnameModule, 'default').mockReturnValue(undefined);
		});

		afterEach(() => {
			jest.mocked(isBrowserModule.default).mockReset();
			jest.mocked(getDefaultReservedUserDataModule.default).mockReset();
			jest.mocked(getHostnameModule.default).mockReset();
		});

		describe('WHEN the tracker uses default trackingApiBaseUrl and identityStore', () => {
			let tracker: Tracker;

			beforeEach(() => {
				tracker = new Tracker({
					trackingApiKey: 'test-api-key',
				});
			});

			describe('WHEN user.identify is called', () => {
				beforeEach(async () => {
					await tracker.user.identify({
						id: 'test-user-id',
						email: 'test@example.com',
						channels: [
							{
								type: 'push',
								address: 'test-123',
								platform: 'android',
							},
						],
						data: {
							first_name: 'test',
							last_name: 'test',
						},
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/track?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								email: 'test@example.com',
								channels: [
									{
										type: 'push',
										address: 'test-123',
										platform: 'android',
									},
								],
								data: {
									first_name: 'test',
									last_name: 'test',
								},
							},
						},
					);
				});
			});

			describe('WHEN user.unidentify is called', () => {
				it('SHOULD do nothing and not throw an error', async () => {
					expect(() => tracker.user.unidentify()).not.toThrow();
				});
			});

			describe('WHEN user.alias is called', () => {
				beforeEach(async () => {
					await tracker.user.alias({
						userId: 'test-user-id',
						newId: 'test-user-id-2',
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://api.getvero.com/api/v2/users/reidentify?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								new_id: 'test-user-id-2',
							},
						},
					);
				});
			});

			describe('WHEN user.unsubscribe is called', () => {
				beforeEach(async () => {
					await tracker.user.unsubscribe({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/unsubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN user.resubscribe is called', () => {
				beforeEach(async () => {
					await tracker.user.resubscribe({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/resubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN user.delete is called', () => {
				beforeEach(async () => {
					await tracker.user.delete({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/delete?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN tag.edit is called', () => {
				beforeEach(async () => {
					await tracker.tag.edit({
						userId: 'test-user-id',
						add: ['test-tag-1', 'test-tag-2'],
						remove: ['test-tag-3'],
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://api.getvero.com/api/v2/users/tags/edit?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								add: ['test-tag-1', 'test-tag-2'],
								remove: ['test-tag-3'],
							},
						},
					);
				});
			});

			describe('WHEN event.track is called', () => {
				beforeEach(async () => {
					jest.useFakeTimers();

					await tracker.event.track({
						identity: {
							userId: 'test-user-id',
							email: 'test@example.com',
						},
						eventName: 'test-event-name',
						data: {
							test: 'test',
						},
					});
				});

				afterEach(() => {
					jest.useRealTimers();
				});

				it('SHOULD track the event by sending the request to the default trackingApiBaseUrl', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/events/track?tracking_api_key=test-api-key',
						{
							body: {
								identity: {
									id: 'test-user-id',
									email: 'test@example.com',
								},
								event_name: 'test-event-name',
								data: {
									test: 'test',
								},
								extras: {
									created_at: new Date().toISOString(),
								},
							},
						},
					);
				});
			});
		});

		describe('WHEN a custom trackingApiBaseUrl is supplied', () => {
			let tracker: Tracker;

			beforeEach(() => {
				tracker = new Tracker({
					trackingApiKey: 'test-api-key',
					trackingApiBaseUrl: 'https://my-vero-proxy.example.com',
				});
			});

			describe('WHEN user.identify is called', () => {
				beforeEach(async () => {
					await tracker.user.identify({
						id: 'test-user-id',
						email: 'test@example.com',
						channels: [
							{
								type: 'push',
								address: 'test-123',
								platform: 'android',
							},
						],
						data: {
							first_name: 'test',
							last_name: 'test',
						},
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/track?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								email: 'test@example.com',
								channels: [
									{
										type: 'push',
										address: 'test-123',
										platform: 'android',
									},
								],
								data: {
									first_name: 'test',
									last_name: 'test',
								},
							},
						},
					);
				});
			});

			describe('WHEN user.alias is called', () => {
				beforeEach(async () => {
					await tracker.user.alias({
						userId: 'test-user-id',
						newId: 'test-user-id-2',
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/reidentify?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								new_id: 'test-user-id-2',
							},
						},
					);
				});
			});

			describe('WHEN user.unsubscribe is called', () => {
				beforeEach(async () => {
					await tracker.user.unsubscribe({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/unsubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN user.resubscribe is called', () => {
				beforeEach(async () => {
					await tracker.user.resubscribe({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/resubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN user.delete is called', () => {
				beforeEach(async () => {
					await tracker.user.delete({
						userId: 'test-user-id',
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/delete?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});
			});

			describe('WHEN tag.edit is called', () => {
				beforeEach(async () => {
					await tracker.tag.edit({
						userId: 'test-user-id',
						add: ['test-tag-1', 'test-tag-2'],
						remove: ['test-tag-3'],
					});
				});

				it('SHOULD send the request to the specified trackingApiBaseUrl', async () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/users/tags/edit?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								add: ['test-tag-1', 'test-tag-2'],
								remove: ['test-tag-3'],
							},
						},
					);
				});
			});

			describe('WHEN event.track is called', () => {
				beforeEach(async () => {
					jest.useFakeTimers();
					await tracker.event.track({
						identity: {
							userId: 'test-user-id',
							email: 'test@example.com',
						},
						eventName: 'test-event-name',
						data: {
							test: 'test',
						},
					});
				});

				afterEach(() => {
					jest.useRealTimers();
				});

				it('SHOULD track the event by sending the request to the specified trackingApiBaseUrl', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://my-vero-proxy.example.com/api/v2/events/track?tracking_api_key=test-api-key',
						{
							body: {
								identity: {
									id: 'test-user-id',
									email: 'test@example.com',
								},
								event_name: 'test-event-name',
								data: {
									test: 'test',
								},
								extras: {
									created_at: new Date().toISOString(),
								},
							},
						},
					);
				});
			});
		});

		describe('WHEN a custom identityStore is supplied', () => {
			let tracker: Tracker;
			let identityStore: IdentityStore;

			beforeEach(() => {
				identityStore = {
					save: jest.fn(),
					get: jest.fn(),
					clear: jest.fn(),
				};
				tracker = new Tracker({
					trackingApiKey: 'test-api-key',
					identityStore: identityStore,
				});
			});

			it('SHOULD use the custom identityStore when user.identify is called', async () => {
				await tracker.user.identify({
					id: 'test-user-id',
					email: 'test@example.com',
					channels: [
						{
							type: 'push',
							address: 'test-123',
							platform: 'android',
						},
					],
					data: {
						first_name: 'test',
						last_name: 'test',
					},
				});

				expect(identityStore.save).toHaveBeenCalledWith(
					'test-user-id',
					'test@example.com',
				);
			});
		});
	});

	describe('browser environment', () => {
		beforeEach(() => {
			Object.defineProperty(global, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true,
			});
			Object.defineProperty(global, 'sessionStorage', {
				value: new LocalStorageMock(),
				writable: true,
			});

			jest.spyOn(isBrowserModule, 'default').mockReturnValue(true);
			jest.spyOn(getDefaultReservedUserDataModule, 'default').mockReturnValue({
				language: 'en',
				timezone: 'Australia/Sydney',
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
			});
			jest
				.spyOn(getHostnameModule, 'default')
				.mockReturnValue('hostname.example.com');
			jest.spyOn(hashStringModule, 'default').mockReturnValue('test-hash');
		});

		afterEach(() => {
			Object.defineProperty(global, 'localStorage', {
				value: undefined,
				writable: true,
			});
			Object.defineProperty(global, 'sessionStorage', {
				value: undefined,
				writable: true,
			});

			jest.mocked(isBrowserModule.default).mockReset();
			jest.mocked(getDefaultReservedUserDataModule.default).mockReset();
			jest.mocked(getHostnameModule.default).mockReset();
			jest.mocked(hashStringModule.default).mockReset();
		});

		describe('WHEN the tracker uses default trackingApiBaseUrl and identityStore', () => {
			let tracker: Tracker;

			beforeEach(() => {
				tracker = new Tracker({
					trackingApiKey: 'test-api-key',
				});
			});

			describe('WHEN user.identify is called', () => {
				beforeEach(async () => {
					jest.useFakeTimers();

					await tracker.user.identify({
						id: 'test-user-id',
						email: 'test@example.com',
						channels: [
							{
								type: 'push',
								address: 'test-123',
								platform: 'android',
							},
						],
						data: {
							first_name: 'test',
							last_name: 'test',
						},
					});
				});

				afterEach(() => {
					jest.useRealTimers();
				});

				it('SHOULD send the request to the default trackingApiBaseUrl including the default reserved user data', () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/track?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								email: 'test@example.com',
								channels: [
									{
										type: 'push',
										address: 'test-123',
										platform: 'android',
									},
								],
								data: {
									first_name: 'test',
									last_name: 'test',
									language: 'en',
									timezone: 'Australia/Sydney',
									userAgent:
										'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
								},
							},
						},
					);
				});

				it('SHOULD store the user data in the LocalStorage', async () => {
					expect(
						localStorage.getItem('test-hash:__vero_tracking_user_id'),
					).toBe('test-user-id');
					expect(localStorage.getItem('test-hash:__vero_tracking_email')).toBe(
						'test@example.com',
					);
				});

				it('SHOULD track a "visited site" event', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/events/track?tracking_api_key=test-api-key',
						{
							body: {
								identity: {
									id: 'test-user-id',
									email: 'test@example.com',
								},
								event_name: 'Visited site',
								data: {
									language: 'en',
									timezone: 'Australia/Sydney',
									userAgent:
										'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
								},
								extras: {
									source: 'hostname.example.com',
									created_at: new Date().toISOString(),
								},
							},
						},
					);
				});

				it('SHOULD set visited in the sessionStorage', async () => {
					expect(
						sessionStorage.getItem(
							'test-hash:__vero_tracking_site_visited:test-user-id',
						),
					).toBe('true');
				});
			});

			describe('WHEN user.unidentify is called', () => {
				beforeEach(async () => {
					await tracker.user.unidentify();
				});

				it('SHOULD remove the user data from the LocalStorage', async () => {
					expect(
						localStorage.getItem('test-hash:__vero_tracking_user_id'),
					).toBeNull();
					expect(
						localStorage.getItem('test-hash:__vero_tracking_email'),
					).toBeNull();
				});

				it('SHOULD remove the visited from the sessionStorage', async () => {
					expect(
						sessionStorage.getItem(
							'test-hash:__vero_tracking_site_visited:test-user-id',
						),
					).toBeNull();
				});
			});

			describe('WHEN user.alias is called', () => {
				beforeEach(async () => {
					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					await tracker.user.alias({
						newId: 'test-user-id-2',
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl with the local storage user data', async () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://api.getvero.com/api/v2/users/reidentify?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								new_id: 'test-user-id-2',
							},
						},
					);
				});

				it('SHOULD update the user data in the LocalStorage', async () => {
					expect(
						localStorage.getItem('test-hash:__vero_tracking_user_id'),
					).toBe('test-user-id-2');
					expect(localStorage.getItem('test-hash:__vero_tracking_email')).toBe(
						'test@example.com',
					);
				});

				describe('WHEN a different userId is provided in the request', () => {
					beforeEach(async () => {
						localStorage.setItem(
							'test-hash:__vero_tracking_user_id',
							'test-user-id',
						);
						localStorage.setItem(
							'test-hash:__vero_tracking_email',
							'test@example.com',
						);

						await tracker.user.alias({
							userId: 'different-user-id',
							newId: 'different-user-id-2',
						});
					});

					it('SHOULD use the new userId', async () => {
						expect(fetch).toHavePutTimes(
							1,
							'https://api.getvero.com/api/v2/users/reidentify?tracking_api_key=test-api-key',
							{
								body: {
									id: 'different-user-id',
									new_id: 'different-user-id-2',
								},
							},
						);
					});

					it('SHOULD not update the local storage', () => {
						expect(
							localStorage.getItem('test-hash:__vero_tracking_user_id'),
						).toBe('test-user-id');
						expect(
							localStorage.getItem('test-hash:__vero_tracking_email'),
						).toBe('test@example.com');
					});
				});
			});

			describe('WHEN user.unsubscribe is called', () => {
				beforeEach(async () => {
					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					await tracker.user.unsubscribe();
				});

				it('SHOULD send the request to the default trackingApiBaseUrl with the local storage user data', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/unsubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});

				describe('WHEN a different userId is provided in the request', () => {
					beforeEach(async () => {
						await tracker.user.unsubscribe({
							userId: 'different-user-id',
						});
					});

					it('SHOULD use the new userId', async () => {
						expect(fetch).toHavePostedTimes(
							1,
							'https://api.getvero.com/api/v2/users/unsubscribe?tracking_api_key=test-api-key',
							{
								body: {
									id: 'different-user-id',
								},
							},
						);
					});
				});
			});

			describe('WHEN user.resubscribe is called', () => {
				beforeEach(() => {
					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					tracker.user.resubscribe();
				});

				it('SHOULD send the request to the default trackingApiBaseUrl with the local storage user data', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/resubscribe?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});

				describe('WHEN a different userId is provided', () => {
					beforeEach(async () => {
						await tracker.user.resubscribe({
							userId: 'different-user-id',
						});
					});

					it('SHOULD use the new userId', async () => {
						expect(fetch).toHavePostedTimes(
							1,
							'https://api.getvero.com/api/v2/users/resubscribe?tracking_api_key=test-api-key',
							{
								body: {
									id: 'different-user-id',
								},
							},
						);
					});
				});
			});

			describe('WHEN user.delete is called', () => {
				beforeEach(async () => {
					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					await tracker.user.delete();
				});

				it('SHOULD send the request to the default trackingApiBaseUrl with the local storage user data', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/users/delete?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
							},
						},
					);
				});

				it('SHOULD delete the user data from the LocalStorage', async () => {
					expect(
						localStorage.getItem('test-hash:__vero_tracking_user_id'),
					).toBeNull();
					expect(
						localStorage.getItem('test-hash:__vero_tracking_email'),
					).toBeNull();
				});

				describe('WHEN a different userId is provided in the request', () => {
					beforeEach(async () => {
						localStorage.setItem(
							'test-hash:__vero_tracking_user_id',
							'test-user-id',
						);
						localStorage.setItem(
							'test-hash:__vero_tracking_email',
							'test@example.com',
						);

						await tracker.user.delete({
							userId: 'different-user-id',
						});
					});

					it('SHOULD use the new userId', async () => {
						expect(fetch).toHavePostedTimes(
							1,
							'https://api.getvero.com/api/v2/users/delete?tracking_api_key=test-api-key',
							{
								body: {
									id: 'different-user-id',
								},
							},
						);
					});

					it('SHOULD not update the local storage', () => {
						expect(
							localStorage.getItem('test-hash:__vero_tracking_user_id'),
						).toBe('test-user-id');
						expect(
							localStorage.getItem('test-hash:__vero_tracking_email'),
						).toBe('test@example.com');
					});
				});
			});

			describe('WHEN tag.edit is called', () => {
				beforeEach(async () => {
					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					await tracker.tag.edit({
						add: ['test-tag-1', 'test-tag-2'],
						remove: ['test-tag-3'],
					});
				});

				it('SHOULD send the request to the default trackingApiBaseUrl with the local storage user data', async () => {
					expect(fetch).toHavePutTimes(
						1,
						'https://api.getvero.com/api/v2/users/tags/edit?tracking_api_key=test-api-key',
						{
							body: {
								id: 'test-user-id',
								add: ['test-tag-1', 'test-tag-2'],
								remove: ['test-tag-3'],
							},
						},
					);
				});

				describe('WHEN a different userId is provided', () => {
					beforeEach(() => {
						tracker.tag.edit({
							userId: 'different-user-id',
							add: ['test-tag-1', 'test-tag-2'],
							remove: ['test-tag-3'],
						});
					});

					it('SHOULD use the new userId', async () => {
						expect(fetch).toHavePutTimes(
							1,
							'https://api.getvero.com/api/v2/users/tags/edit?tracking_api_key=test-api-key',
							{
								body: {
									id: 'different-user-id',
									add: ['test-tag-1', 'test-tag-2'],
									remove: ['test-tag-3'],
								},
							},
						);
					});
				});
			});

			describe('WHEN event.track is called', () => {
				beforeEach(async () => {
					jest.useFakeTimers();

					localStorage.setItem(
						'test-hash:__vero_tracking_user_id',
						'test-user-id',
					);
					localStorage.setItem(
						'test-hash:__vero_tracking_email',
						'test@example.com',
					);

					await tracker.event.track({
						eventName: 'test-event-name',
						data: {
							test: 'test',
						},
					});
				});

				afterEach(() => {
					jest.useRealTimers();
				});

				it('SHOULD send the request to the default trackingApiBaseUrl using the local storage user data with default reserved user data and hostname source', async () => {
					expect(fetch).toHavePostedTimes(
						1,
						'https://api.getvero.com/api/v2/events/track?tracking_api_key=test-api-key',
						{
							body: {
								identity: {
									id: 'test-user-id',
									email: 'test@example.com',
								},
								event_name: 'test-event-name',
								data: {
									test: 'test',
									language: 'en',
									timezone: 'Australia/Sydney',
									userAgent:
										'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
								},
								extras: {
									source: 'hostname.example.com',
									created_at: new Date().toISOString(),
								},
							},
						},
					);
				});

				describe('WHEN a different userId and email are provided', () => {
					beforeEach(async () => {
						await tracker.event.track({
							identity: {
								userId: 'different-user-id',
								email: 'different@example.com',
							},
							eventName: 'test-event-name',
							data: {
								test: 'test',
							},
						});
					});

					it('SHOULD use the new userId and email', async () => {
						expect(fetch).toHavePostedTimes(
							1,
							'https://api.getvero.com/api/v2/events/track?tracking_api_key=test-api-key',
							{
								body: {
									identity: {
										id: 'different-user-id',
										email: 'different@example.com',
									},
									event_name: 'test-event-name',
									data: {
										test: 'test',
										language: 'en',
										timezone: 'Australia/Sydney',
										userAgent:
											'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
									},
									extras: {
										source: 'hostname.example.com',
										created_at: new Date().toISOString(),
									},
								},
							},
						);
					});

					it('SHOULD not update the local storage', () => {
						expect(
							localStorage.getItem('test-hash:__vero_tracking_user_id'),
						).toBe('test-user-id');
						expect(
							localStorage.getItem('test-hash:__vero_tracking_email'),
						).toBe('test@example.com');
					});
				});

				describe("WHEN the local storage's identity is empty", () => {
					beforeEach(async () => {
						localStorage.removeItem('test-hash:__vero_tracking_user_id');
						localStorage.removeItem('test-hash:__vero_tracking_email');

						await tracker.event.track({
							identity: {
								userId: 'different-user-id',
								email: 'different@example.com',
							},
							eventName: 'test-event-name',
							data: {
								test: 'test',
							},
						});
					});

					it('SHOULD update the local storage', () => {
						expect(
							localStorage.getItem('test-hash:__vero_tracking_user_id'),
						).toBe('different-user-id');
						expect(
							localStorage.getItem('test-hash:__vero_tracking_email'),
						).toBe('different@example.com');
					});
				});
			});
		});
	});
});
