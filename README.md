# Boilerplate MCP Server

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript. This project demonstrates how to build a well-structured MCP server that exposes tools to AI applications like Claude Desktop.

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

To test the server with the MCP Inspector (a debugging tool for MCP servers):

```bash
npm run inspector
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

The project follows a clean architecture pattern with clear separation of concerns:

- `src/index.ts` - Main entry point for the MCP server
- `src/controllers/` - Business logic layer that handles core functionality, transforms responses from services, and formats data
- `src/services/` - Data access layer that interacts with external APIs and data sources
- `src/tools/` - MCP tool definitions and parameter schemas using Zod
- `src/utils/` - Shared utilities like logging
- `dist/` - Compiled JavaScript output (generated after build)

### Current Implementation

The server currently implements an IP address lookup tool that demonstrates the MCP architecture:

1. The tool definition in `src/tools/ipaddress.tool.ts` specifies the interface and parameters
2. The controller in `src/controllers/ipaddress.controller.ts` handles the business logic
3. The service in `src/services/vendor.ip-api.com.service.ts` fetches data from the external API

## About MCP

The Model Context Protocol (MCP) is a standardized protocol developed by Anthropic for connecting AI applications (clients) with tools, resources, and data (servers). It enables seamless interoperability between LLM hosts and external systems, fostering a local-first, extensible AI ecosystem.

### Key Features

- **Resources**: Expose data (e.g., files, database records) for clients to use as context
- **Tools**: Executable functions that clients can call (e.g., querying a database, fetching weather data)
- **Prompts**: Reusable templates for guiding LLM interactions
- **Transport**: Supports STDIO (local process communication) and HTTP/SSE (remote communication)

### Architecture

MCP follows a client-server architecture:

- **MCP Hosts**: AI applications like Claude Desktop that need access to external data
- **MCP Clients**: Components within hosts that connect to servers
- **MCP Servers**: Lightweight programs (like this one) that expose specific capabilities through the standardized protocol

## License

ISC 