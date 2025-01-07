import {
	type IdentityStore,
	LocalStorageIdentityStore,
} from './identity-store';
import Network from './network';
import {
	type LegacySessionCookieSiteVisitedStore,
	SessionStorageSiteVisitedStore,
	type SiteVisitedStore,
} from './site-visited-store';
import getDefaultReservedUserData from './utils/getDefaultReservedUserData';
import getHostname from './utils/getHostname';
import hashString from './utils/hashString';
import isBrowser from './utils/isBrowser';
import throwError from './utils/throwError';
import type { Optional } from './utils/types';

export interface TrackerOptions {
	trackingApiKey: string;
	trackingApiBaseUrl?: string;
	/**
	 * When you call {@link Tracker#user.identify}, the user's identity is stored in this {@link IdentityStore}.
	 *
	 * By default, in the browser environment, the {@link LocalStorageIdentityStore} is used. In any other
	 * environment where localStorage is not available (e.g., Node.js), the user identity will not be stored.
	 *
	 * You can implement your own {@link IdentityStore} to store the user identity differently, such as using
	 * `AsyncLocalStorage` in Node.js or Cookies.
	 */
	identityStore?: IdentityStore;
	/**
	 * Controls whether the "visited site" event should be tracked when a user is identified.
	 *
	 * By default, in the browser environment, the {@link SessionStorageSiteVisitedStore} is used. When you call
	 * {@link Tracker#user.identify}, a "visited site" event is tracked against the user if such an event has not
	 * been previously tracked in the current page session.
	 *
	 * This SDK also includes a {@link LegacySessionCookieSiteVisitedStore} that uses Session Cookies to track
	 * "visited site". This is handy if you are migrating from the legacy Vero SDK m.js and want to keep exactly
	 * identical "visited site" event tracking behavior. Here are the differences between the two:
	 * - `sessionStorage` is more reliable in terms of when the session data is cleared, that is, when the tab is closed.
	 *   Session Cookies' clearing behavior may vary across browsers and devices.
	 * - `sessionStorage` is more secure as the data will not be sent over the network. Session Cookies are sent over the
	 *   network.
	 * - If the user opens a new tab for the same site, they will be in different sessions when using
	 *   {@link SessionStorageSiteVisitedStore}, and thus "visited site" events will be tracked again. Session Cookies
	 *   are not affected by this.
	 * - The {@link LegacySessionCookieSiteVisitedStore} is not user-id-specific.
	 *
	 * Where possible, we recommend using the default {@link SessionStorageSiteVisitedStore}
	 * instead of {@link LegacySessionCookieSiteVisitedStore}.
	 */
	siteVisitedStore?: SiteVisitedStore;
}

export interface NoSiteVisitEventRequest {
	/**
	 * Set this to true if you do not want to track a "visited site" event. By default, a "visited site" event is
	 * tracked when a user is identified and the {@link SiteVisitedStore#hasVisited} returns false.
	 */
	noSiteVisitEvent?: boolean;
}

export interface UserIdentifyRequest extends NoSiteVisitEventRequest {
	/**
	 * The unique identifier of the customer
	 *
	 * @example "1000"
	 */
	id: string;
	/**
	 * The email of the customer
	 *
	 * @example "test@example.com"
	 */
	email: string;
	/**
	 * An array containing objects that represent the user's device token.
	 * Each object should represent a single device token and include the fields type, address, and platform.
	 */
	channels?: {
		/**
		 * @example "push"
		 */
		type: string;
		/**
		 * @example "UNIQUE_DEVICE_TOKEN"
		 */
		address: string;
		/**
		 * @example "android"
		 */
		platform: string;
	}[];
	/**
	 * An object containing key value pairs that represent the custom user properties you want to update.
	 *
	 * In the browser environment, the `language`, `timezone` and `userAgent` attributes are reserved properties
	 * that will be automatically populated by the SDK. If any of these attributes are defined in the request,
	 * they will be overwritten by the SDK.
	 *
	 * All other keys are freeform and can be defined by you.
	 *
	 * @example { first_name: "Damien", last_name: "Brzoska", age: 30 }
	 */
	data?: Record<string, string | number>;
}

export interface OptionalUserIdRequest {
	/**
	 * The unique identifier of the customer.
	 *
	 * Optional in the browser environment, if `identify` was called prior.
	 *
	 * @example "1000"
	 */
	userId?: string;
}

export interface UserAliasRequest extends OptionalUserIdRequest {
	/**
	 * The new unique identifier of the user
	 *
	 * @example "1001"
	 */
	newId: string;
}

export interface UserUnsubscribeRequest extends OptionalUserIdRequest {}

export interface UserResubscribeRequest extends OptionalUserIdRequest {}

export interface UserDeleteRequest extends OptionalUserIdRequest {}

export interface TagEditRequest extends OptionalUserIdRequest {
	/**
	 * An array of tags to add
	 */
	add?: string[];
	/**
	 * An array of tags to remove
	 */
	remove?: string[];
}

interface BaseEventTrackRequest {
	/**
	 * A valid object containing the keys id and email used to identify the user for which the event is being tracked.
	 * Both email and id must be less than 255 characters, and email must be a valid email address.
	 *
	 * Optional in the browser environment, if `identify` was called prior.
	 */
	identity?: {
		/**
		 * The unique identifier of the customer
		 * @example "1000"
		 */
		userId: string;
		/**
		 * The email of the customer
		 * @example "test@example.com"
		 */
		email: string;
	};
	/**
	 * The name of the event tracked. Must be less than 255 characters.
	 *
	 * Capitalized and lowercase letters and spaces and underscores will be treated the same by Vero's API.
	 * For example, `Purchased Item`, `purchased item`, and `purchased_item` will all be matched as one event
	 * in Vero's backend.
	 *
	 * @example "Viewed product"
	 */
	eventName: string;
	/**
	 * An object containing key value pairs that represent the custom user properties you want to track with the event.
	 * All keys are freeform and can be defined by you.
	 *
	 * @example { product_name: "Red T-shirt", product_url: "http://www.yourdomain.com/products/red-t-shirt" }
	 */
	data?: Record<string, string | number>;
	/**
	 * An object containing key value pairs that represent the reserved,
	 * Vero-specific `created_at` and `source` properties.
	 *
	 * @see {@link Tracker#event.track}
	 */
	extras?: {
		/**
		 * @example "Segment.com"
		 */
		source: string;
		/**
		 * @example "2023-05-30T04:46:31+0000"
		 */
		createdAt: string;
	};
}

export interface EventTrackRequest
	extends NoSiteVisitEventRequest,
		Optional<BaseEventTrackRequest, 'identity'> {}

class Tracker {
	private readonly network: Network;
	private readonly identityStore: IdentityStore | null;
	private readonly siteVisitedStore: SiteVisitedStore | null;

	constructor(options: TrackerOptions) {
		this.network = new Network(
			options.trackingApiBaseUrl ?? 'https://api.getvero.com/api/v2',
			options.trackingApiKey,
		);

		this.identityStore = options.identityStore ?? null;
		const hashedTrackingKey = hashString(options.trackingApiKey);
		if (!this.identityStore && isBrowser()) {
			try {
				this.identityStore = new LocalStorageIdentityStore({
					keyNamespace: hashedTrackingKey,
				});
			} catch (e) {
				console.error(
					'Unable to create LocalStorageIdentityStore, no identities will be stored',
					e,
				);
			}
		}
		this.siteVisitedStore = options.siteVisitedStore ?? null;
		if (!this.siteVisitedStore && isBrowser()) {
			try {
				this.siteVisitedStore = new SessionStorageSiteVisitedStore({
					keyNamespace: hashedTrackingKey,
				});
			} catch (e) {
				console.error(
					'Unable to create SessionStorageSiteVisitedStore, no site visited events will be tracked',
					e,
				);
			}
		}
	}

	readonly user = {
		/**
		 * Creates a new user profile if the user doesn't exist yet.
		 * Otherwise, the user profile is updated based on the properties provided.
		 *
		 * This method must be called before calling any other tracking methods,
		 * unless the `userId` parameter is provided in the subsequent calls to other methods.
		 * The identity will be stored in the specified {@link TrackerOptions.identityStore}
		 * (default to using Local Storage in the browser). This means you don't need to call this method every time
		 * the user refreshes the page or navigates to a new page.
		 *
		 * This method will also track a "visited site" event after the user is identified
		 * (only in the browser environment). You can disable this behavior by setting `noSiteVisitEvent` to `true`
		 * in the request.
		 *
		 * @param request {@link UserIdentifyRequest}
		 */
		identify: async (request: UserIdentifyRequest) => {
			await this.network.send('/users/track', 'POST', {
				id: request.id,
				email: request.email,
				channels: request.channels ?? [],
				data: { ...request.data, ...getDefaultReservedUserData() },
			});
			this.identityStore?.save(request.id, request.email);

			if (this.getShouldTrackVisitedSiteEvent(request, request.id)) {
				await this.event.track({
					eventName: 'Visited site',
				});
				this.siteVisitedStore?.setVisited(request.id);
			}
		},
		/**
		 * Removes a user from the {@link TrackerOptions.identityStore}. This is generally used when a user logs out.
		 *
		 * This method does not delete the user from Vero. To delete a user, use {@link Tracker#user.delete}.
		 *
		 * This method does nothing if no {@link Tracker#user.identify} was called.
		 */
		unidentify: () => {
			const userId = this.identityStore?.get()?.userId;
			this.identityStore?.clear();
			if (userId) {
				this.siteVisitedStore?.clear(userId);
			}
		},
		/**
		 * Changes a user's identifier (`id`).
		 *
		 * This method is used to merge two user identities, merging two sets of user data into one.
		 * This is an advanced method and may have unintended consequences.
		 * Please get in touch if you have questions regarding its usage.
		 *
		 * @param request {@link UserAliasRequest}
		 */
		alias: async (request: UserAliasRequest) => {
			const userId = this.getUserId(request);
			await this.network.send('/users/reidentify', 'PUT', {
				id: userId,
				new_id: request.newId,
			});

			const storedIdentity = this.identityStore?.get();
			if (storedIdentity?.userId === userId) {
				this.identityStore?.save(request.newId, storedIdentity.email);
			}
		},
		/**
		 * Unsubscribes a user globally.
		 *
		 * @param request {@link UserUnsubscribeRequest}
		 */
		unsubscribe: async (request?: UserUnsubscribeRequest) => {
			const userId = this.getUserId(request);
			await this.network.send('/users/unsubscribe', 'POST', {
				id: userId,
			});
		},
		/**
		 * Resubscribes a user globally.
		 *
		 * @param request {@link UserResubscribeRequest}
		 */
		resubscribe: async (request?: UserResubscribeRequest) => {
			const userId = this.getUserId(request);
			await this.network.send('/users/resubscribe', 'POST', {
				id: userId,
			});
		},
		/**
		 * Deletes a user.
		 *
		 * @param request {@link UserDeleteRequest}
		 */
		delete: async (request?: UserDeleteRequest) => {
			const userId = this.getUserId(request);
			await this.network.send('/users/delete', 'POST', {
				id: userId,
			});
			if (userId === this.identityStore?.get()?.userId) {
				this.user.unidentify();
			}
		},
	} as const;

	readonly tag = {
		/**
		 * Adds tags to a user's profile or removes tags from a user's profile.
		 *
		 * @param request {@link TagEditRequest}
		 */
		edit: async (request: TagEditRequest) => {
			const userId = this.getUserId(request);
			await this.network.send('/users/tags/edit', 'PUT', {
				id: userId,
				add: request.add ?? [],
				remove: request.remove ?? [],
			});
		},
	} as const;

	readonly event = {
		/**
		 * Tracks an event for a specific user.
		 *
		 * If `identity` is specified and the user profile doesn't exist, Vero will create it.
		 *
		 * Vero will automatically deduplicate events that are sent to our API with the same `eventName`,
		 * the same properties, and that are tracked against the same user id within a three-minute window.
		 * This is designed to solve issues related to JavaScript event handling and retries.
		 * You can force Vero to ignore deduplication and track every event by including a property within
		 * data with a unique timestamp. This will ensure the event is not seen by the Vero system as
		 * a duplicate due to the unique data.
		 *
		 * If the user has not been identified, a "Visited Site" event will be sent prior to the event being tracked.
		 * You can disable this behavior by setting `noSiteVisitEvent` to `true` in the request.
		 *
		 * @param request {@link EventTrackRequest}
		 */
		track: async (request: EventTrackRequest) => {
			const identity =
				request.identity ??
				this.identityStore?.get() ??
				throwError(
					'No userId or identity provided (have you called identify?)',
				);

			if (
				this.getShouldTrackVisitedSiteEvent(request, identity.userId) &&
				request.eventName.toLowerCase().replaceAll('_', ' ') !== 'visited site'
			) {
				await this.sendEventTrackRequest({
					identity,
					eventName: 'Visited site',
				});
				this.siteVisitedStore?.setVisited(identity.userId);
			}

			await this.sendEventTrackRequest({
				identity,
				...request,
			});

			const identityStoreUserId = this.identityStore?.get()?.userId;
			if (
				identityStoreUserId === undefined ||
				identity.userId === identityStoreUserId
			) {
				this.identityStore?.save(identity.userId, identity.email);
			}
		},
	} as const;

	private async sendEventTrackRequest(
		request: BaseEventTrackRequest & {
			identity: {
				userId: string;
				email: string;
			};
		},
	) {
		await this.network.send('/events/track', 'POST', {
			identity: {
				id: request.identity.userId,
				email: request.identity.email,
			},
			event_name: request.eventName,
			data: { ...request.data, ...getDefaultReservedUserData() },
			extras: {
				source: request.extras?.source ?? getHostname(),
				created_at: request.extras?.createdAt ?? new Date().toISOString(),
			},
		});
	}

	private getUserId(request?: OptionalUserIdRequest) {
		if (request?.userId) {
			return request.userId;
		}
		const identity = this.identityStore?.get();
		if (!identity) {
			throw new Error(
				'No userId or identity provided (have you called identify?)',
			);
		}
		return identity.userId;
	}

	private getShouldTrackVisitedSiteEvent(
		request: NoSiteVisitEventRequest,
		userId: string,
	) {
		return (
			this.siteVisitedStore !== null &&
			!this.siteVisitedStore.hasVisited(userId) &&
			!request.noSiteVisitEvent
		);
	}
}

export default Tracker;
