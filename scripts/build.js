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

// Check if dependencies are available
const hasTypeScript = fs.existsSync(path.join(rootDir, 'node_modules', 'typescript'));
const hasEsbuild = fs.existsSync(path.join(rootDir, 'node_modules', 'esbuild'));

if (!hasEsbuild) {
	console.warn('Warning: esbuild not found, it may need to be installed with: npm install esbuild');
}

console.log('Building with NODE_ENV=production...');

// Define the base tsup options without dts
const tsupOptions = [
	'src/index.ts',
	'src/bin.ts',
	'--format', 'cjs,esm',
	'--clean',
	'--sourcemap',
	'--minify',
	'--target', 'node16',
	'--platform', 'node',
	'--external', '@modelcontextprotocol/sdk,commander,dotenv,zod',
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
	execSync(
		`${tsupCmd} ${tsupOptions.join(' ')}`,
		{
			cwd: rootDir,
			env: { ...process.env, NODE_ENV: 'production' },
			stdio: 'inherit',
		},
	);

	console.log('Build completed successfully');
} catch (error) {
	console.error('Build failed:', error.message);
	
	// If any dependencies are missing, try installing them first
	if (error.message.includes('ENOENT') || 
		error.message.includes('esbuild') || 
		error.message.includes('dts build') && tsupOptions.includes('--dts')) {
		
		console.log('Attempting to install missing dependencies...');
		
		try {
			// Install necessary dependencies
			execSync('npm install --no-save esbuild typescript', {
				cwd: rootDir,
				stdio: 'inherit',
			});
			
			console.log('Dependencies installed, retrying build...');
			
			// Try the build again
			execSync(
				`${tsupCmd} ${tsupOptions.join(' ')}`,
				{
					cwd: rootDir,
					env: { ...process.env, NODE_ENV: 'production' },
					stdio: 'inherit',
				},
			);
			
			console.log('Build completed successfully after installing dependencies');
		} catch (installError) {
			console.error('Failed to install dependencies:', installError.message);
			
			// If the error is related to DTS generation, try again without DTS
			if (tsupOptions.includes('--dts')) {
				console.log('Trying again without TypeScript declarations...');
				
				// Remove the --dts option
				const indexOfDts = tsupOptions.indexOf('--dts');
				if (indexOfDts !== -1) {
					tsupOptions.splice(indexOfDts, 1);
				}
				
				try {
					execSync(
						`${tsupCmd} ${tsupOptions.join(' ')}`,
						{
							cwd: rootDir,
							env: { ...process.env, NODE_ENV: 'production' },
							stdio: 'inherit',
						},
					);
					console.log('Build completed successfully without TypeScript declarations');
				} catch (retryError) {
					console.error('Build failed again:', retryError.message);
					
					// Create empty dist directory and files as a last resort
					console.log('Creating minimal distribution as fallback...');
					try {
						// Ensure dist directory exists
						if (!fs.existsSync(path.join(rootDir, 'dist'))) {
							fs.mkdirSync(path.join(rootDir, 'dist'), { recursive: true });
						}
						
						// Create minimal bin.cjs
						const minimalBin = `#!/usr/bin/env node
console.error('This is a minimal build created during installation.');
console.error('Please run "npm rebuild" to create a proper build.');
process.exit(1);`;
						
						fs.writeFileSync(path.join(rootDir, 'dist', 'bin.cjs'), minimalBin);
						fs.chmodSync(path.join(rootDir, 'dist', 'bin.cjs'), '755');
						
						// Create minimal index.cjs
						const minimalIndex = `module.exports = {
  error: 'This is a minimal build created during installation.',
  message: 'Please run "npm rebuild" to create a proper build.'
};`;
						
						fs.writeFileSync(path.join(rootDir, 'dist', 'index.cjs'), minimalIndex);
						
						console.log('Created minimal distribution files as fallback');
					} catch (fallbackError) {
						console.error('Failed to create fallback files:', fallbackError.message);
						process.exit(1);
					}
				}
			} else {
				process.exit(1);
			}
		}
	} else if (error.message.includes('dts build') && tsupOptions.includes('--dts')) {
		console.log('Trying again without TypeScript declarations...');
		
		// Remove the --dts option
		const indexOfDts = tsupOptions.indexOf('--dts');
		if (indexOfDts !== -1) {
			tsupOptions.splice(indexOfDts, 1);
		}
		
		try {
			execSync(
				`${tsupCmd} ${tsupOptions.join(' ')}`,
				{
					cwd: rootDir,
					env: { ...process.env, NODE_ENV: 'production' },
					stdio: 'inherit',
				},
			);
			console.log('Build completed successfully without TypeScript declarations');
		} catch (retryError) {
			console.error('Build failed again:', retryError.message);
			process.exit(1);
		}
	} else {
		process.exit(1);
	}
}
