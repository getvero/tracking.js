import type { PreInitVeroTracker } from './pre-init';
import Tracker, { type TrackerOptions } from './tracker';

let globalTrackerInstance: Tracker | null = null;
const tracker = new Proxy<PreInitVeroTracker>(
	{
		init(options: TrackerOptions) {
			globalTrackerInstance = new Tracker(options);
		},
	},
	{
		get(target, p, receiver) {
			if (p === 'initialized') {
				return !!globalTrackerInstance;
			}

			if (globalTrackerInstance) {
				if (p === 'init') {
					throw new Error('Tracker is already initialized.');
				}
				return Reflect.get(globalTrackerInstance, p, receiver);
			}

			if (p !== 'init') {
				throw new Error(
					'Tracker is not initialized. Please call init() before using the tracker.',
				);
			}
			return Reflect.get(target, p, receiver);
		},
	},
) as PreInitVeroTracker & Tracker & { initialized: boolean };

export type {
	TrackerOptions,
	UserIdentifyRequest,
	OptionalUserIdRequest,
	UserAliasRequest,
	UserUnsubscribeRequest,
	UserResubscribeRequest,
	UserDeleteRequest,
	TagEditRequest,
	EventTrackRequest,
} from './tracker';
export {
	type IdentityStore,
	LocalStorageIdentityStore,
} from './identity-store';
export {
	type SiteVisitedStore,
	SessionStorageSiteVisitedStore,
	LegacySessionCookieSiteVisitedStore,
} from './site-visited-store';
export { Tracker };
export default tracker;
