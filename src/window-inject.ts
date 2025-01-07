import { LocalStorageIdentityStore } from './identity-store';
import tracker from './index';
import type { PreInitVeroTracker } from './pre-init';
import { SessionStorageSiteVisitedStore } from './site-visited-store';
import { LegacySessionCookieSiteVisitedStore } from './site-visited-store';
import type Tracker from './tracker';

declare global {
	interface Window {
		vero: {
			LocalStorageIdentityStore: typeof LocalStorageIdentityStore;
			SessionStorageSiteVisitedStore: typeof SessionStorageSiteVisitedStore;
			LegacySessionCookieSiteVisitedStore: typeof LegacySessionCookieSiteVisitedStore;
			tracker: PreInitVeroTracker & Tracker;
		};
	}
}

window.vero = {
	...window.vero,
	LocalStorageIdentityStore,
	SessionStorageSiteVisitedStore,
	LegacySessionCookieSiteVisitedStore,
	tracker: tracker,
};
