export interface PreInitVeroTracker {
	init: (options: { trackingApiKey: string }) => void;
}
