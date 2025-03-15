#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.util.js';

import ipAddressTools from './tools/ipaddress.tool.js';
import ipLookupResources from './resources/ipaddress.resource.js';
import { runCli } from './cli/index.js';

let serverInstance: McpServer | null = null;
let transportInstance: SSEServerTransport | StdioServerTransport | null = null;

export async function startServer(mode: 'stdio' | 'sse' = 'stdio') {
	serverInstance = new McpServer({
		name: '@aashari/boilerplate-mcp-server',
		version: '1.1.7',
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

// Main entry point
async function main() {
	// Check if arguments are provided (CLI mode)
	if (process.argv.length > 2) {
		// CLI mode: Pass arguments to CLI runner
		await runCli(process.argv.slice(2));
	} else {
		// MCP Server mode: Start server with default STDIO
		await startServer();
	}
}

main();
