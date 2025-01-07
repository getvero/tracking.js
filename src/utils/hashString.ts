/**
 * Hash a string using the djb2 algorithm
 * @param str
 */
const hashString = (str: string): string => {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) + hash + str.charCodeAt(i);
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
};

export default hashString;
