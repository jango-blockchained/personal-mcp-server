#!/usr/bin/env node

/**
 * This script ensures that required dependencies are installed
 * It's used as a fallback during installation if esbuild or typescript are missing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name and root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('Checking dependencies...');

// Define required dependencies
const requiredDeps = ['esbuild', 'typescript', 'tsup'];

// Check each dependency
for (const dep of requiredDeps) {
	const depPath = path.join(rootDir, 'node_modules', dep);
	if (!fs.existsSync(depPath)) {
		console.log(`${dep} not found, installing...`);
		try {
			execSync(`npm install --no-save ${dep}`, {
				cwd: rootDir,
				stdio: 'inherit',
			});
			console.log(`${dep} installed successfully`);
		} catch (error) {
			console.error(`Failed to install ${dep}: ${error.message}`);
		}
	} else {
		console.log(`${dep} found in node_modules`);
	}
}

// Create fallback files if dist directory doesn't exist
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
	console.log('Creating dist directory and fallback files...');
	try {
		fs.mkdirSync(distDir, { recursive: true });

		// Create bin.cjs
		const binPath = path.join(distDir, 'bin.cjs');
		fs.writeFileSync(
			binPath,
			`#!/usr/bin/env node
console.error('This is a fallback build created during installation.');
console.error('Please run "npm rebuild" to create a proper build.');
process.exit(1);
`,
		);
		fs.chmodSync(binPath, '755');

		// Create index.cjs
		fs.writeFileSync(
			path.join(distDir, 'index.cjs'),
			`module.exports = {
  error: 'This is a fallback build created during installation.',
  message: 'Please run "npm rebuild" to create a proper build.'
};
`,
		);

		console.log('Fallback files created successfully');
	} catch (error) {
		console.error(`Failed to create fallback files: ${error.message}`);
	}
}

console.log('Dependency check completed');
