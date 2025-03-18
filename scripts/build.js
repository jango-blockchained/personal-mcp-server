#!/usr/bin/env node
/**
 * Simple build script for global installation
 * This script avoids ESM import issues by using child_process to run tsup directly with options
 * instead of using tsup.config.ts
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name and root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Check if tsup is installed locally
const nodeModulesPath = path.join(rootDir, 'node_modules', '.bin', 'tsup');
const hasTsupLocal = fs.existsSync(nodeModulesPath);
const tsupCmd = hasTsupLocal ? nodeModulesPath : 'npx tsup';

console.log('Building with NODE_ENV=production...');

// Define all the tsup options directly here instead of using the config file
// Use only options available in CLI mode (see tsup --help)
const tsupOptions = [
	'src/index.ts',
	'src/bin.ts',
	'--format',
	'cjs,esm',
	'--dts',
	'--clean',
	'--sourcemap',
	'--minify',
	'--target',
	'node16',
	'--platform',
	'node',
	'--external',
	'@modelcontextprotocol/sdk,commander,dotenv,zod',
	'--shims',
];

try {
	// Run the build command with appropriate environment variables
	execSync(`${tsupCmd} ${tsupOptions.join(' ')}`, {
		cwd: rootDir,
		env: { ...process.env, NODE_ENV: 'production' },
		stdio: 'inherit',
	});

	console.log('Build completed successfully');
} catch (error) {
	console.error('Build failed:', error.message);
	process.exit(1);
}
