# Boilerplate MCP Server

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript. This project demonstrates how to build a well-structured MCP server that exposes both tools and resources to AI applications like Claude Desktop. It serves as a starting point for developers building MCP-compatible servers with a focus on clean architecture, automated workflows, and easy deployment.

## Core Features

- **STDIO MCP Server**: Designed for AI clients like Claude Desktop, providing tools and resources via the Model Context Protocol.
- **CLI Support**: Human-friendly command-line interface for the same functionality, making it easy to test and use directly.
- **Automated Release Management**: GitHub Actions workflow for continuous integration, testing, and publishing to GitHub Packages.

## Prerequisites

- **Node.js**: v22.14.0 or higher (specified in `.node-version` and `package.json`).
- **npm**: Comes with Node.js, used for package management.

## Installation

Install dependencies locally:

```bash
npm install
```

This sets up the project with `@modelcontextprotocol/sdk` and development tools like `tsup`, `jest`, and `eslint`.

## Development

For detailed development instructions, including how to implement your own functionality, please refer to the [Development Guide](DEVELOPMENT.md).

## Running Locally

Run the compiled JavaScript code:

```bash
npm start
```

This executes `node dist/index.cjs`, starting the MCP server with `stdio` transport.

## Running with npx

Run the server without local installation:

- **From GitHub Packages** (after publishing via CI/CD):
  ```bash
  npx -y @aashari/boilerplate-mcp-server
  ```
- **Directly from GitHub Repository**:
  ```bash
  npx -y aashari/boilerplate-mcp-server
  ```

Both commands fetch the package, run `npm run build` (via `prepare` script), and execute the `mcp-server` command defined in `package.json`'s `bin` field. The `-y` flag skips prompts for a seamless experience.

## Using as a CLI Tool

The package can also be used as a command-line tool for human interaction:

- **Get help and available commands**:
  ```bash
  npx -y @aashari/boilerplate-mcp-server --help
  ```

- **Get current device IP details**:
  ```bash
  npx -y @aashari/boilerplate-mcp-server get_ip_details
  ```

- **Get details for a specific IP address**:
  ```bash
  npx -y @aashari/boilerplate-mcp-server get_ip_details 8.8.8.8
  ```

When run without arguments, the package starts the MCP Server for AI clients:
```bash
npx -y @aashari/boilerplate-mcp-server
```

## Creating Your Own MCP Server

This boilerplate is designed to be easily customized for your own MCP server. Here's how to get started:

### 1. Fork the Repository

Start by forking this repository to your own GitHub account.

### 2. Customize the Package Information

Update the package information in `package.json`:
- Change the `name` to your package name (e.g., `@yourusername/your-mcp-server`)
- Update the `description`, `repository`, `author`, and other fields
- Run `npm run update-version 1.0.0` to ensure all version references are updated

### 3. Implement Your Own Functionality

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow the detailed steps in the [Development Guide](DEVELOPMENT.md).

## Version Management

Update the project version across `package.json`, `src/index.ts`, and CLI constants:

```bash
npm run update-version <new-version>
```

Example: `npm run update-version 1.2.0`. This script ensures version consistency, validated against SemVer format (e.g., `x.y.z`, `x.y.z-beta`).

## CI/CD with GitHub Actions

A GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates continuous integration and deployment:

### Continuous Integration

On every push to the `main` branch:

- Checks code formatting with `prettier --check`.
- Lints code with `eslint`.
- Builds with `tsup` to verify compilation.
- Runs unit tests with `jest`.

### Continuous Deployment

- Detects version changes in `package.json`.
- If changed:
  - Publishes to GitHub Packages (`@aashari/boilerplate-mcp-server`).
  - Creates and pushes a Git tag (e.g., `v1.2.0`).

This ensures the latest version is available on GitHub Packages, tagged in the repository, and ready for `npx -y` usage.

## Project Structure

The project follows a clean architecture pattern with clear separation of concerns:

- **`src/index.ts`**: Main entry point, initializes the MCP server or CLI based on arguments.
- **`src/controllers/`**: Business logic (e.g., `ipaddress.controller.ts`).
- **`src/services/`**: External API integration (e.g., `vendor.ip-api.com.service.ts`).
- **`src/tools/`**: MCP tool definitions with Zod schemas (e.g., `ipaddress.tool.ts`).
- **`src/resources/`**: MCP resource definitions (e.g., `ipaddress.resource.ts`).
- **`src/cli/`**: CLI command definitions (e.g., `ipaddress.cli.ts`).
- **`src/utils/`**: Shared utilities (e.g., `logger.util.ts`).
- **`scripts/`**: Utility scripts (e.g., `update-version.js`).
- **`dist/`**: Compiled output (generated by `tsup`).

### Current Implementation

The server provides IP address functionality in three ways:

1. **Tool: `get_ip_details`**:

   - **Location**: `src/tools/ipaddress.tool.ts`
   - **Parameters**: Optional `ipAddress` (string).
   - **Functionality**: Returns IP details for a specified IP or the current device if none provided.
   - **Usage**: Callable by MCP clients.

2. **Resource: `Current Device IP`**:
   - **Location**: `src/resources/ipaddress.resource.ts`
   - **URI**: `ip://current`
   - **Functionality**: Exposes current device IP details as a text/plain resource.
   - **Usage**: Accessible as context by MCP hosts.

3. **CLI Command: `get_ip_details`**:
   - **Location**: `src/cli/ipaddress.cli.ts`
   - **Parameters**: Optional `ipAddress` argument.
   - **Functionality**: Displays IP details in the terminal for human users.
   - **Usage**: `npx -y @aashari/boilerplate-mcp-server get_ip_details [ipAddress]`

**Data Flow**:

1. `ipaddress.controller.ts` orchestrates the logic for all three interfaces.
2. `vendor.ip-api.com.service.ts` fetches data from `http://ip-api.com/json`.
3. Results are formatted and returned to the client (MCP or CLI).

## About MCP

The Model Context Protocol (MCP), developed by Anthropic, connects AI applications (clients) with tools, resources, and data (servers). It fosters a local-first, extensible AI ecosystem by enabling seamless interoperability with LLM hosts.

### Key Features

- **Resources**: Expose data (e.g., files, IP details) for client context.
- **Tools**: Executable functions (e.g., IP lookup) for client invocation.
- **Prompts**: Reusable templates for LLM interactions (not implemented here).
- **Transport**: Supports STDIO (used here) and HTTP/SSE (planned).

### Architecture

- **MCP Hosts**: AI apps (e.g., Claude Desktop) needing external data.
- **MCP Clients**: Components within hosts connecting to servers.
- **MCP Servers**: Lightweight programs (like this) exposing capabilities via MCP.

## Testing

Run unit tests:

```bash
npm test
```

Generate a test coverage report:

```bash
npm run test:coverage
```

Tests in `src/**/*.test.ts` verify controller and service functionality using Jest.

## Contributing

Contributions are welcome! Fork the repository, make changes, and submit a pull request to `main`. Ensure tests pass and formatting/linting standards are met.

## License

[ISC](https://opensource.org/licenses/ISC)
