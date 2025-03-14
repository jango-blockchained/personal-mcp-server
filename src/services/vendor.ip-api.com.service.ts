import { logger } from '../utils/logger.util.js';
import { IPDetail } from './vendor.ip-api.com.type.js';

const ENDPOINT = 'http://ip-api.com/json';

async function get(ipAddress?: string): Promise<IPDetail> {
	logger.debug(`[src/services/vendor.ip-api.com.ts@get] Calling the API...`);
	const response = await fetch(`${ENDPOINT}/${ipAddress ?? ''}`);
	return response.json() as Promise<IPDetail>;
}

export default { get };
