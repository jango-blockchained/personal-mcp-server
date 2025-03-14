import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';

import ipAddressController from '../controllers/ipaddress.controller.js';

/**
 * Register IP lookup resources with the MCP server
 * @param server The MCP server instance
 */
function register(server: McpServer) {
	logger.debug(
		`[src/resources/iplookup.resource.ts@register] Registering IP lookup resources...`,
	);
	server.resource(
		'Current Device IP',
		'ip://current',
		{
			description: 'Details about your current IP address',
		},
		async (_uri, _extra) => {
			const resourceContent = await ipAddressController.get();
			return {
				contents: [
					{
						uri: 'ip://current',
						text: resourceContent.content,
						mimeType: 'text/plain',
						description: 'Details about your current IP address',
					},
				],
			};
		},
	);
}

export default { register };
