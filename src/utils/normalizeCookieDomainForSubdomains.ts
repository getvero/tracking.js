/**
 * Adds a leading dot to a cookie domain if it doesn't already have one so the cookie will be set on all subdomains.
 */
const normalizeCookieDomainForSubdomains = (domain: string) =>
	domain.startsWith('.') ? domain : `.${domain}`;

export default normalizeCookieDomainForSubdomains;
