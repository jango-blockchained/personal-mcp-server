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

// Check if typescript is available (for d.ts generation)
const hasTypeScript = fs.existsSync(path.join(rootDir, 'node_modules', 'typescript'));

console.log('Building with NODE_ENV=production...');

// Define the base tsup options without dts
const tsupOptions = [
	'src/index.ts',
	'src/bin.ts',
	'--format',
	'cjs,esm',
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
	'--no-config',
];

// Add dts option if typescript is available
if (hasTypeScript) {
	tsupOptions.push('--dts');
	console.log('TypeScript is available, will generate declaration files');
} else {
	console.log('TypeScript is not available, skipping declaration files');
}

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

	// If the error is related to DTS generation, try again without DTS
	if (error.message.includes('dts build') && tsupOptions.includes('--dts')) {
		console.log('Trying again without TypeScript declarations...');

		// Remove the --dts option
		const indexOfDts = tsupOptions.indexOf('--dts');
		if (indexOfDts !== -1) {
			tsupOptions.splice(indexOfDts, 1);
		}

		try {
			execSync(`${tsupCmd} ${tsupOptions.join(' ')}`, {
				cwd: rootDir,
				env: { ...process.env, NODE_ENV: 'production' },
				stdio: 'inherit',
			});
			console.log('Build completed successfully without TypeScript declarations');
		} catch (retryError) {
			console.error('Build failed again:', retryError.message);
			process.exit(1);
		}
	} else {
		process.exit(1);
	}
}
