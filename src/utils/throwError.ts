const throwError = (error: string | Error): never => {
	if (typeof error === 'string') throw new Error(error);
	throw error;
};

export default throwError;
