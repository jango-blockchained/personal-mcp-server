import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts', // Library entry
        bin: 'src/bin.ts',     // CLI entry
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    shims: true,
    outExtension({ format }) {
        return {
            js: format === 'esm' ? '.mjs' : '.cjs',
            dts: format === 'esm' ? '.d.mts' : '.d.cts',
        };
    },
    external: ['@modelcontextprotocol/sdk', 'commander', 'dotenv', 'zod'],
    platform: 'node',
    target: 'node16',
}); 