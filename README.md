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

Run the server in development mode with hot reloading using `ts-node`:

```bash
npm run dev
```

Test the server with the MCP Inspector (a debugging tool for MCP servers):

```bash
npm run inspector
```

Both commands use the `stdio` transport by default, as defined in `src/index.ts`.

## Building

Compile the TypeScript code to JavaScript using `tsup`:

```bash
npm run build
```

This generates `dist/index.cjs` (executable CommonJS bundle) and `dist/index.d.cts` (TypeScript declarations). The `prebuild` script (`rimraf dist`) ensures a clean `dist/` folder before each build.

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

The boilerplate includes IP address lookup functionality as an example. To add your own functionality:

1. **Create a Service**: 
   - Create a new file in `src/services/` (e.g., `weather.service.ts`)
   - Implement API calls or data processing logic
   - Example for a weather service:
   ```typescript
   // src/services/weather.service.ts
   import { logger } from '../utils/logger.util.js';

   interface WeatherData {
     location: string;
     temperature: number;
     conditions: string;
     // Add more fields as needed
   }

   async function get(location: string): Promise<WeatherData> {
     logger.debug(`[src/services/weather.service.ts@get] Getting weather for ${location}...`);
     // Call a weather API here
     // For example: const response = await fetch(`https://api.weather.com/v1/${encodeURIComponent(location)}`);
     
     // Mock data for demonstration
     return {
       location,
       temperature: 22,
       conditions: 'Sunny',
     };
   }

   export default { get };
   ```

2. **Create a Controller**:
   - Create a new file in `src/controllers/` (e.g., `weather.controller.ts`)
   - Implement business logic that uses your service
   - Example:
   ```typescript
   // src/controllers/weather.controller.ts
   import weatherService from '../services/weather.service.js';
   import { logger } from '../utils/logger.util.js';

   async function get(location: string) {
     logger.debug(`[src/controllers/weather.controller.ts@get] Getting weather for ${location}...`);
     const weatherData = await weatherService.get(location);
     logger.debug(
       `[src/controllers/weather.controller.ts@get] Got the response from the service`,
       weatherData,
     );
     
     return {
       content: `Weather for ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.conditions}`,
     };
   }

   export default { get };
   ```

3. **Create a Tool**:
   - Create type definitions in `src/tools/weather.type.ts`
   - Implement the tool in `src/tools/weather.tool.ts`
   - Example:
   ```typescript
   // src/tools/weather.type.ts
   import { z } from 'zod';

   const WeatherToolArgs = z.object({
     location: z.string(),
   });

   type WeatherToolArgsType = z.infer<typeof WeatherToolArgs>;

   export { WeatherToolArgs, type WeatherToolArgsType };
   ```

   ```typescript
   // src/tools/weather.tool.ts
   import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
   import { logger } from '../utils/logger.util.js';
   import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
   import { WeatherToolArgs, WeatherToolArgsType } from './weather.type.js';

   import weatherController from '../controllers/weather.controller.js';

   async function getWeatherInfo(args: WeatherToolArgsType, _extra: RequestHandlerExtra) {
     logger.debug(`[src/tools/weather.tool.ts@getWeatherInfo] Getting weather for ${args.location}...`);
     const message = await weatherController.get(args.location);
     logger.debug(
       `[src/tools/weather.tool.ts@getWeatherInfo] Got the response from the controller`,
       message,
     );
     return {
       content: [
         {
           type: 'text' as const,
           text: message.content,
         },
       ],
     };
   }

   function register(server: McpServer) {
     logger.debug(`[src/tools/weather.tool.ts@register] Registering tools...`);
     server.tool(
       'get_weather_info',
       'Get weather information for a specific location',
       WeatherToolArgs.shape,
       getWeatherInfo,
     );
   }

   export default { register };
   ```

4. **Create a CLI Command** (optional):
   - Create a new file in `src/cli/weather.cli.ts`
   - Example:
   ```typescript
   // src/cli/weather.cli.ts
   import { Command } from 'commander';
   import { logger } from '../utils/logger.util.js';
   import weatherController from '../controllers/weather.controller.js';

   function register(program: Command) {
     logger.debug(`[src/cli/weather.cli.ts@register] Registering weather CLI commands...`);
     
     program
       .command('get_weather_info')
       .description('Get weather information for a specific location')
       .argument('<location>', 'Location to get weather for')
       .action(async (location: string) => {
         try {
           logger.info(
             `[src/cli/weather.cli.ts@get_weather_info] Fetching weather for ${location}...`,
           );
           const result = await weatherController.get(location);
           console.log(result.content);
         } catch (error) {
           logger.error(
             '[src/cli/weather.cli.ts@get_weather_info] Failed to get weather',
             error,
           );
           process.exit(1);
         }
       });
   }

   export default { register };
   ```

5. **Register Your Components**:
   - Update `src/index.ts` to register your tool
   - Update `src/cli/index.ts` to register your CLI command

### 4. Test Your Implementation

- Test the MCP server with the MCP Inspector: `npm run inspector`
- Test the CLI: `npm run build && node dist/index.cjs get_weather_info "New York"`
- Write unit tests in `src/controllers/weather.test.ts` and `src/services/weather.test.ts`

### 5. Deploy and Publish

- Push your changes to GitHub
- The CI/CD workflow will automatically build, test, and publish your package when you update the version

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
