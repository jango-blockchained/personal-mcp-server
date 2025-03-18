#!/usr/bin/env node
import { logger } from './utils/logger.util.js';
import { config } from './utils/config.util.js';
import { runCli } from './cli/index.js';
import { startServer } from './index.js';

// Main CLI entry point
async function main() {
	// Load configuration
	config.load();

	// Log the DEBUG value to verify configuration loading
	logger.info(`[src/bin.ts] DEBUG value: ${process.env.DEBUG}`);
	logger.info(
		`[src/bin.ts] IPAPI_API_TOKEN value exists: ${Boolean(process.env.IPAPI_API_TOKEN)}`,
	);
	logger.info(`[src/bin.ts] Config DEBUG value: ${config.get('DEBUG')}`);

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
