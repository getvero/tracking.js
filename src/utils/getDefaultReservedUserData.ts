import isBrowser from './isBrowser';

const getDefaultReservedUserData = () => {
	if (isBrowser()) {
		return {
			language: window.navigator.language,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			userAgent: window.navigator.userAgent,
		};
	}
	return {};
};

export default getDefaultReservedUserData;
