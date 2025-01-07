const isBrowser = () => {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export default isBrowser;
