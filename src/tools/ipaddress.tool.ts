import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { IpAddressToolArgs, IpAddressToolArgsType } from './ipaddress.type.js';

import ipAddressController from '../controllers/ipaddress.controller.js';

async function getIpAddressDetails(args: IpAddressToolArgsType, _extra: RequestHandlerExtra) {
	logger.debug(`[src/tools/ipaddress.tool.ts@getIpAddressDetails] Getting IP address details...`);
	const message = await ipAddressController.get(args.ipAddress);
	logger.debug(
		`[src/tools/ipaddress.tool.ts@getIpAddressDetails] Got the response from the controller`,
		message,
	);
	return {
		content: [
			{
				type: 'text' as const,
				text: message.content,
			},
		],
	};
}

function register(server: McpServer) {
	logger.debug(`[src/tools/ipaddress.ts@register] Registering tools...`);
	server.tool(
		'get-ip-details',
		'Get details about a specific IP address or the current device (if no IP address is provided)',
		IpAddressToolArgs.shape,
		getIpAddressDetails,
	);
}

export default { register };
