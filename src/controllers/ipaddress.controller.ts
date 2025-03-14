import ipApiService from '../services/vendor.ip-api.com.service.js';
import { logger } from '../utils/logger.util.js';

async function get(ipAddress?: string) {
	logger.debug(`[src/controllers/ipaddress.controller.ts@get] Getting IP address details...`);
	const ipData = await ipApiService.get(ipAddress);
	logger.debug(
		`[src/controllers/ipaddress.controller.ts@get] Got the response from the service`,
		ipData,
	);
	const lines: string[] = [];
	for (const [key, value] of Object.entries(ipData)) {
		lines.push(`${key}: ${value}`);
	}
	return {
		content: lines.join('\n'),
	};
}

export default { get };
