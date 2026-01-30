import isBrowser from './isBrowser';

/**
 * Extracts the `vero_conv` query parameter value from the current URL.
 * Returns null if not in a browser environment or if the parameter is not present.
 */
const getVeroConvParam = (): string | null => {
	if (!isBrowser()) return null;
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('vero_conv');
};

export default getVeroConvParam;
