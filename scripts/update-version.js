#!/usr/bin/env node

/**
 * Script to update version numbers across the project
 * Usage: node scripts/update-version.js <new-version>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Get the new version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Error: No version specified');
  console.error('Usage: node scripts/update-version.js <new-version>');
  process.exit(1);
}

// Validate version format (simple check for semver-like format)
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(newVersion)) {
  console.error('Error: Invalid version format. Please use semver format (e.g., 1.2.3, 1.2.3-beta, etc.)');
  process.exit(1);
}

// Update package.json
const packageJsonPath = path.join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n');
  console.log(`Updated package.json: ${oldVersion} → ${newVersion}`);
} catch (error) {
  console.error(`Error updating package.json: ${error.message}`);
  process.exit(1);
}

// Update src/index.ts
const indexTsPath = path.join(rootDir, 'src', 'index.ts');
try {
  let indexTsContent = fs.readFileSync(indexTsPath, 'utf8');
  const versionRegex = /(version: ['"])([^'"]+)(['"])/;
  const match = indexTsContent.match(versionRegex);
  
  if (match) {
    const oldVersion = match[2];
    indexTsContent = indexTsContent.replace(versionRegex, `$1${newVersion}$3`);
    fs.writeFileSync(indexTsPath, indexTsContent);
    console.log(`Updated src/index.ts: ${oldVersion} → ${newVersion}`);
  } else {
    console.warn('Warning: Could not find version in src/index.ts');
  }
} catch (error) {
  console.error(`Error updating src/index.ts: ${error.message}`);
  process.exit(1);
}

console.log(`\nVersion successfully updated to ${newVersion}`); 