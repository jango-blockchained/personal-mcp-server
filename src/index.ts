import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.util.js';

import ipAddressTools from './tools/ipaddress.tool.js';
import ipLookupResources from './resources/ipaddress.resource.js';

let serverInstance: McpServer | null = null;
let transportInstance: SSEServerTransport | StdioServerTransport | null = null;

export async function main(mode: 'stdio' | 'sse' = 'stdio') {
	serverInstance = new McpServer({
		name: 'Demo',
		version: '1.0.0',
	});

	if (mode === 'stdio') {
		transportInstance = new StdioServerTransport();
	} else {
		throw new Error('SSE mode is not supported yet');
	}

	logger.info(
		`[src/index.ts] Starting server with ${mode.toUpperCase()} transport...`,
		process.env,
	);

	// register tools
	ipAddressTools.register(serverInstance);

	// register resources
	ipLookupResources.register(serverInstance);

	return serverInstance.connect(transportInstance).catch(err => {
		logger.error(`[src/index.ts] Failed to start server`, err);
		process.exit(1);
	});
}

main();
