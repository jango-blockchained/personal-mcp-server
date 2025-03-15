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

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow these steps:

1. **Create Service Types**:
   - Create a new file in `src/services/` (e.g., `weather.service.type.ts`)
   - Define the data structures for your service
   - Example:
   ```typescript
   // src/services/weather.service.type.ts
   export interface WeatherData {
     location: string;
     temperature: number;
     conditions: string;
     humidity: number;
     windSpeed: number;
     timestamp: string;
   }
   ```

2. **Create a Service**:
   - Create a new file in `src/services/` (e.g., `weather.service.ts`)
   - Implement API calls or data processing logic
   - Example:
   ```typescript
   // src/services/weather.service.ts
   import { logger } from '../utils/logger.util.js';
   import { WeatherData } from './weather.service.type.js';

   async function get(location: string): Promise<WeatherData> {
     logger.debug(`[src/services/weather.service.ts@get] Getting weather for ${location}...`);
     // Call a weather API here
     // For example: const response = await fetch(`https://api.weather.com/v1/${encodeURIComponent(location)}`);
     
     // Mock data for demonstration
     return {
       location,
       temperature: 22,
       conditions: 'Sunny',
       humidity: 65,
       windSpeed: 10,
       timestamp: new Date().toISOString(),
     };
   }

   export default { get };
   ```

3. **Create a Controller**:
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
     
     const lines: string[] = [];
     lines.push(`Location: ${weatherData.location}`);
     lines.push(`Temperature: ${weatherData.temperature}°C`);
     lines.push(`Conditions: ${weatherData.conditions}`);
     lines.push(`Humidity: ${weatherData.humidity}%`);
     lines.push(`Wind Speed: ${weatherData.windSpeed} km/h`);
     lines.push(`Updated: ${weatherData.timestamp}`);
     
     return {
       content: lines.join('\n'),
     };
   }

   export default { get };
   ```

4. **Create Tool Types**:
   - Create a new file in `src/tools/` (e.g., `weather.type.ts`)
   - Define Zod schema for tool arguments
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

5. **Create a Tool**:
   - Create a new file in `src/tools/` (e.g., `weather.tool.ts`)
   - Implement the MCP tool that uses your controller
   - Example:
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

6. **Create a Resource** (optional):
   - Create a new file in `src/resources/` (e.g., `weather.resource.ts`)
   - Implement the MCP resource
   - Example:
   ```typescript
   // src/resources/weather.resource.ts
   import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
   import { logger } from '../utils/logger.util.js';

   import weatherController from '../controllers/weather.controller.js';

   /**
    * Register weather resources with the MCP server
    * @param server The MCP server instance
    */
   function register(server: McpServer) {
     logger.debug(
       `[src/resources/weather.resource.ts@register] Registering weather resources...`,
     );
     server.resource(
       'Default Location Weather',
       'weather://default',
       {
         description: 'Weather information for the default location (New York)',
       },
       async (_uri, _extra) => {
         const resourceContent = await weatherController.get('New York');
         return {
           contents: [
             {
               uri: 'weather://default',
               text: resourceContent.content,
               mimeType: 'text/plain',
               description: 'Weather information for New York',
             },
           ],
         };
       },
     );
   }

   export default { register };
   ```

7. **Create a CLI Command**:
   - Create a new file in `src/cli/` (e.g., `weather.cli.ts`)
   - Implement the CLI command
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

8. **Update Main Entry Point**:
   - Modify `src/index.ts` to register your tool and resource
   - Example:
   ```typescript
   // src/index.ts (partial)
   import weatherTools from './tools/weather.tool.js';
   import weatherResources from './resources/weather.resource.js';

   export async function startServer(mode: 'stdio' | 'sse' = 'stdio') {
     // ... existing code ...

     // register tools
     ipAddressTools.register(serverInstance);
     weatherTools.register(serverInstance);  // Add this line

     // register resources
     ipLookupResources.register(serverInstance);
     weatherResources.register(serverInstance);  // Add this line

     // ... existing code ...
   }
   ```

9. **Update CLI Entry Point**:
   - Modify `src/cli/index.ts` to register your CLI command
   - Example:
   ```typescript
   // src/cli/index.ts (partial)
   import ipAddressCli from './ipaddress.cli.js';
   import weatherCli from './weather.cli.js';  // Add this line

   export async function runCli(args: string[]) {
     // ... existing code ...

     // Register CLI commands
     ipAddressCli.register(program);
     weatherCli.register(program);  // Add this line

     // ... existing code ...
   }
   ```

10. **Create Tests**:
    - Create test files for your controller and service
    - Example:
    ```typescript
    // src/controllers/weather.test.ts
    import weatherController from './weather.controller';
    import weatherService from '../services/weather.service';

    // Mock the weather service
    jest.mock('../services/weather.service', () => ({
      get: jest.fn(),
    }));

    describe('Weather Controller', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should format weather data correctly', async () => {
        // Mock the service response
        const mockWeatherData = {
          location: 'Test City',
          temperature: 25,
          conditions: 'Cloudy',
          humidity: 70,
          windSpeed: 15,
          timestamp: '2023-01-01T12:00:00Z',
        };
        (weatherService.get as jest.Mock).mockResolvedValue(mockWeatherData);

        // Call the controller
        const result = await weatherController.get('Test City');

        // Verify the service was called
        expect(weatherService.get).toHaveBeenCalledWith('Test City');

        // Verify the result
        expect(result.content).toContain('Location: Test City');
        expect(result.content).toContain('Temperature: 25°C');
        expect(result.content).toContain('Conditions: Cloudy');
      });
    });
    ```

### 4. Test Your Implementation

- Test the MCP server with the MCP Inspector: `npm run inspector`
- Test the CLI: `npm run build && node dist/index.cjs get_weather_info "New York"`
- Run your tests: `npm test`

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
