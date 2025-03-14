# Boilerplate MCP Server

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript. This project demonstrates how to build a well-structured MCP server that exposes both tools and resources to AI applications like Claude Desktop.

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
- `src/services/` - Data access layer that interacts with external APIs and data sources (e.g., ip-api.com)
- `src/tools/` - MCP tool definitions and parameter schemas using Zod
- `src/resources/` - MCP resource definitions that expose data like IP address details
- `src/utils/` - Shared utilities like logging
- `dist/` - Compiled JavaScript output (generated after build)

### Current Implementation

The server currently implements IP address functionality in two ways:

1. **As a Tool**: `get_ip_details`
   - Defined in `src/tools/ipaddress.tool.ts`
   - Accepts an optional IP address parameter
   - Returns details about the specified IP or the current device

2. **As a Resource**: `Current Device IP`
   - Defined in `src/resources/ipaddress.resource.ts`
   - Exposes IP information as a resource at `ip://current`
   - Provides details about the current device's IP address

Both implementations follow the same data flow:
1. The controller (`ipaddress.controller.ts`) handles the business logic
2. The service (`vendor.ip-api.com.service.ts`) fetches data from the external API
3. The data is formatted and returned to the client

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

## Testing

Run tests with:

```bash
npm test
```

Generate test coverage report:

```bash
npm run test:coverage
```

## License

ISC 