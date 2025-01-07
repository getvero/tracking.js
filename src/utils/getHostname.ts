import isBrowser from './isBrowser';

const getHostname = () => {
	if (isBrowser()) {
		return window.location.hostname;
	}
};

export default getHostname;
