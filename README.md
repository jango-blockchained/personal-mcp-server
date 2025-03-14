# Boilerplate MCP Server

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript.

## Prerequisites

- Node.js v22.14.0 or higher
- npm (comes with Node.js)

## Installation

```bash
npm install
```

## Development

To run the server in development mode with hot reloading:

```bash
npm run dev
```

## Building

To compile the TypeScript code to JavaScript:

```bash
npm run build
```

## Running

To run the compiled JavaScript code:

```bash
npm start
```

## Project Structure

- `src/index.ts` - Main entry point for the MCP server
- `dist/` - Compiled JavaScript output (generated after build)

## About MCP

The Model Context Protocol (MCP) is a standardized protocol for connecting AI applications (clients) with tools, resources, and data (servers). It enables seamless interoperability between LLM hosts and external systems, fostering a local-first, extensible AI ecosystem.

### Key Features

- **Resources**: Expose data (e.g., files, database records) for clients to use as context.
- **Tools**: Executable functions that clients can call (e.g., querying a database, fetching weather data).
- **Prompts**: Reusable templates for guiding LLM interactions.
- **Transport**: Supports STDIO (local process communication) and HTTP/SSE (remote communication).

## License

ISC 