# Development Guide for Boilerplate MCP Server

This guide provides detailed instructions for developing and extending the Boilerplate MCP Server.

## Quick Start for New Developers

```bash
# Clone the repository
git clone https://github.com/aashari/boilerplate-mcp-server.git
cd boilerplate-mcp-server

# Install dependencies
npm install

# Create a .env file (optional)
echo "DEBUG=true" > .env

# Start the development server with hot reloading
npm run dev

# In another terminal, test the CLI
npm run dev -- --help
npm run dev -- get-ip-details

# Test with the MCP Inspector
npm run inspector
# Then open http://localhost:5173/ in your browser
```

## Prerequisites

- **Node.js**: v22.14.0 or higher (specified in `.node-version` and `package.json`).
- **npm**: Comes with Node.js, used for package management.

## Installation

Install dependencies locally:

```bash
npm install
```

This sets up the project with `@modelcontextprotocol/sdk` and development tools like `tsup`, `jest`, and `eslint`.

## Development Environment

### Running the MCP Server in Development Mode

Run the server in development mode with hot reloading using `ts-node`:

```bash
npm run dev
```

### Testing with the MCP Inspector

To test the MCP server during development:

```bash
npm run inspector
```

Then:
1. Open http://localhost:5173/ in your browser
2. Click the "Start" button in the inspector interface

This provides a visual interface for testing your MCP server's tools and resources. You can:
- View available tools and their parameters
- Execute tools with custom parameters
- See the response format
- Debug issues in real-time

### Using CLI Commands in Development Mode

To see available CLI commands during development:

```bash
npm run dev -- --help
```

To run a specific CLI command during development:

```bash
npm run dev -- get-ip-details
```

Example for running other commands:

```bash
npm run dev -- list-spaces
```

Both the MCP server and CLI commands use the `stdio` transport by default, as defined in `src/index.ts`.

## Building

Compile the TypeScript code to JavaScript using `tsup`:

```bash
npm run build
```

This generates `dist/index.cjs` (executable CommonJS bundle) and `dist/index.d.cts` (TypeScript declarations). The `prebuild` script (`rimraf dist`) ensures a clean `dist/` folder before each build.

## Running the Built Version

Run the compiled JavaScript code:

```bash
npm start
```

This executes `node dist/index.cjs`, starting the MCP server with `stdio` transport.

Run a CLI command with the built version:

```bash
npm start -- get-ip-details
```

## Project Structure

The project follows a clean architecture pattern with clear separation of concerns:

```
src/
├── index.ts                  # Main entry point
├── controllers/              # Business logic
│   └── ipaddress.controller.ts
├── services/                 # External API integration
│   └── vendor.ip-api.com.service.ts
├── tools/                    # MCP tool definitions with Zod schemas
│   └── ipaddress.tool.ts
├── resources/                # MCP resource definitions
│   └── ipaddress.resource.ts
├── cli/                      # CLI command definitions
│   └── ipaddress.cli.ts
└── utils/                    # Shared utilities
    ├── config.util.ts
    └── logger.util.ts
```

### Data Flow Architecture

The project uses a layered architecture with clear separation of concerns:

1. **Entry Points**: `src/index.ts` initializes either the MCP server or CLI based on arguments
2. **Tools/CLI**: Define the interface for users (MCP clients or CLI users)
3. **Controllers**: Contain business logic and orchestrate operations
4. **Services**: Handle external API calls and data processing
5. **Utils**: Provide shared functionality across the application

This architecture ensures:
- Single responsibility for each component
- Easy testing of individual layers
- Clear data flow through the application
- Consistent error handling

### Current Implementation

The server provides IP address functionality in three ways:

1. **Tool: `get-ip-details`**:

   - **Location**: `src/tools/ipaddress.tool.ts`
   - **Parameters**: Optional `ipAddress` (string).
   - **Functionality**: Returns IP details for a specified IP or the current device if none provided.
   - **Usage**: Callable by MCP clients.

2. **Resource: `Current Device IP`**:
   - **Location**: `src/resources/ipaddress.resource.ts`
   - **URI**: `ip://current`
   - **Functionality**: Exposes current device IP details as a text/plain resource.
   - **Usage**: Accessible as context by MCP hosts.

3. **CLI Command: `get-ip-details`**:
   - **Location**: `src/cli/ipaddress.cli.ts`
   - **Parameters**: Optional `ipAddress` argument.
   - **Functionality**: Displays IP details in the terminal for human users.
   - **Usage**: `npx -y aashari/boilerplate-mcp-server get-ip-details [ipAddress]`

**Data Flow**:

1. `ipaddress.controller.ts` orchestrates the logic for all three interfaces.
2. `vendor.ip-api.com.service.ts` fetches data from `http://ip-api.com/json`.
3. Results are formatted and returned to the client (MCP or CLI).

## Configuration System

The boilerplate includes a flexible configuration system that loads settings from multiple sources with a defined priority order:

1. **Direct Environment Variables**: Highest priority, set when running the command.
   ```bash
   DEBUG=true IPAPI_API_TOKEN=your_token npm run dev
   ```

2. **.env File**: Medium priority, stored in the project root.
   ```
   DEBUG=true
   IPAPI_API_TOKEN=your_token
   ```

3. **Global Configuration File**: Lowest priority, stored at `$HOME/.mcp/configs.json`.
   ```json
   {
     "@aashari/boilerplate-mcp-server": {
       "environments": {
         "DEBUG": "true",
         "IPAPI_API_TOKEN": "your_token"
       }
     }
   }
   ```

### Using the Configuration System

To access configuration values in your code, import the `config` utility:

```typescript
import { config } from '../utils/config.util.js';

// Get a string value
const apiToken = config.get('API_TOKEN');

// Get a boolean value
const isDebug = config.getBoolean('DEBUG');

// Get a value with a default
const timeout = config.get('API_TIMEOUT', '5000');
```

### Adding New Configuration Options

When implementing new functionality that requires configuration:

1. Document the configuration options in your code.
2. Use the `config` utility to access the values.
3. Provide sensible defaults for optional configuration.
4. Update the README.md with the new configuration options.

Example service using configuration:

```typescript
// src/services/example.service.ts
import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';

async function callApi() {
  const apiToken = config.get('EXAMPLE_API_TOKEN');
  const apiUrl = config.get('EXAMPLE_API_URL', 'https://api.example.com');
  
  logger.debug(`[src/services/example.service.ts@callApi] Calling API at ${apiUrl}`);
  
  // Use apiToken and apiUrl to make the API call
  // ...
}

export default { callApi };
```

### Configuration Priority

The configuration system follows a cascading priority where values from higher priority sources override lower priority ones. This allows you to:
- Use global configuration for shared settings across projects
- Override global settings with project-specific settings in `.env`
- Override both with command-line environment variables for temporary changes

## Implementing Your Own Functionality

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow these steps:

### Step-by-Step Implementation Guide

1. **Plan your feature**: Define what your feature will do and how it will be exposed (tool, resource, CLI)
2. **Create service types**: Define data structures for your service
3. **Implement the service**: Create API calls or data processing logic
4. **Create the controller**: Implement business logic using your service
5. **Define tool types**: Create Zod schemas for tool arguments
6. **Implement the tool**: Register the MCP tool that uses your controller
7. **Add resources (optional)**: Implement MCP resources if needed
8. **Create CLI commands**: Implement CLI commands for human interaction

### 1. Create Service Types

Create a new file in `src/services/` (e.g., `weather.service.type.ts`) to define the data structures for your service:

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

### 2. Create a Service

Create a new file in `src/services/` (e.g., `weather.service.ts`) to implement API calls or data processing logic:

```typescript
// src/services/weather.service.ts
import { logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';
import { WeatherData } from './weather.service.type.js';

async function get(location: string): Promise<WeatherData> {
  logger.debug(`[src/services/weather.service.ts@get] Getting weather for ${location}...`);
  
  // Get API key from configuration
  const apiKey = config.get('WEATHER_API_KEY');
  const apiUrl = config.get('WEATHER_API_URL', 'https://api.weather.com/v1');
  
  // Call a weather API here
  // For example:
  // const url = `${apiUrl}/${encodeURIComponent(location)}?key=${apiKey}`;
  // const response = await fetch(url);
  
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

### 3. Create a Controller

Create a new file in `src/controllers/` (e.g., `weather.controller.ts`) to implement business logic that uses your service:

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

### 4. Create Tool Types

Create a new file in `src/tools/` (e.g., `weather.type.ts`) to define Zod schema for tool arguments:

```typescript
// src/tools/weather.type.ts
import { z } from 'zod';

const WeatherToolArgs = z.object({
  location: z.string(),
});

type WeatherToolArgsType = z.infer<typeof WeatherToolArgs>;

export { WeatherToolArgs, type WeatherToolArgsType };
```

### 5. Create a Tool

Create a new file in `src/tools/` (e.g., `weather.tool.ts`) to implement the MCP tool that uses your controller:

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
    'get-weather-info',
    'Get weather information for a specific location',
    WeatherToolArgs.shape,
    getWeatherInfo,
  );
}

export default { register };
```

### 6. Create a Resource (optional)

Create a new file in `src/resources/` (e.g., `weather.resource.ts`) to implement the MCP resource:

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

### 7. Create a CLI Command

Create a new file in `src/cli/` (e.g., `weather.cli.ts`) to implement the CLI command:

```typescript
// src/cli/weather.cli.ts
import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';
import weatherController from '../controllers/weather.controller.js';

function register(program: Command) {
  logger.debug(`[src/cli/weather.cli.ts@register] Registering weather CLI commands...`);
  
  program
    .command('get-weather-info')
    .description('Get weather information for a specific location')
    .argument('<location>', 'Location to get weather for')
    .action(async (location: string) => {
      try {
        logger.info(
          `[src/cli/weather.cli.ts@get-weather-info] Fetching weather for ${location}...`,
        );
        const result = await weatherController.get(location);
        console.log(result.content);
      } catch (error) {
        logger.error(
          '[src/cli/weather.cli.ts@get-weather-info] Failed to get weather',
          error,
        );
        process.exit(1);
      }
    });
}

export default { register };
```

### 8. Register Your Components

Finally, update `src/index.ts` to register your new components:

```typescript
// Import your new components
import weatherTool from './tools/weather.tool.js';
import weatherResource from './resources/weather.resource.js';
import weatherCli from './cli/weather.cli.js';

// In the server initialization section
weatherTool.register(server);
weatherResource.register(server);

// In the CLI initialization section
weatherCli.register(program);
```

## Testing

### Running Tests

Run unit tests:

```bash
npm test
```

Generate a test coverage report:

```bash
npm run test:coverage
```

Tests in `src/**/*.test.ts` verify controller and service functionality using Jest.

### Writing Tests

Create test files with the `.test.ts` extension next to the files they test. For example:

```typescript
// src/controllers/weather.controller.test.ts
import weatherController from './weather.controller.js';
import weatherService from '../services/weather.service.js';

// Mock the weather service
jest.mock('../services/weather.service.js');

describe('Weather Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should format weather data correctly', async () => {
    // Mock the service response
    (weatherService.get as jest.Mock).mockResolvedValue({
      location: 'New York',
      temperature: 22,
      conditions: 'Sunny',
      humidity: 65,
      windSpeed: 10,
      timestamp: '2023-01-01T12:00:00Z',
    });

    // Call the controller
    const result = await weatherController.get('New York');

    // Verify the result
    expect(result.content).toContain('Location: New York');
    expect(result.content).toContain('Temperature: 22°C');
    expect(weatherService.get).toHaveBeenCalledWith('New York');
  });
});
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

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow the detailed steps in the previous section.

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

## Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js v22.14.0 or higher. Use `node -v` to check.
2. **Missing Dependencies**: If you encounter errors about missing modules, run `npm install` to ensure all dependencies are installed.
3. **Port Conflicts**: If the MCP Inspector fails to start, check if port 5173 is already in use.
4. **TypeScript Errors**: If you see TypeScript errors, ensure your code follows the project's TypeScript configuration.

### Debugging

1. **Enable Debug Logging**: Set `DEBUG=true` in your environment or `.env` file.
2. **Use the MCP Inspector**: The inspector provides a visual interface for testing your MCP server.
3. **Check the Logs**: Look for log messages with the `[src/...]` prefix to trace the execution flow.

## Contributing

Contributions are welcome! Fork the repository, make changes, and submit a pull request to `main`. Ensure tests pass and formatting/linting standards are met.