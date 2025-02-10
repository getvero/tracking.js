import isBrowser from './isBrowser';

const getDefaultReservedUserData = () => {
	if (isBrowser()) {
		return {
			language: window.navigator.language,
			timezone: (new Date().getTimezoneOffset() / 60) * -1,
			ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			userAgent: window.navigator.userAgent,
		};
	}
	return {};
};

export default getDefaultReservedUserData;
