# Development Guide

This guide provides detailed instructions for developing and extending the Boilerplate MCP Server.

## Development Environment

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

## Implementing Your Own Functionality

The boilerplate includes IP address lookup functionality as an example. To add your own functionality (e.g., weather information), follow these steps:

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
    'get_weather_info',
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

### 8. Update Main Entry Point

Modify `src/index.ts` to register your tool and resource:

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

### 9. Update CLI Entry Point

Modify `src/cli/index.ts` to register your CLI command:

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

### 10. Create Tests

Create test files for your controller and service:

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

## Testing Your Implementation

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

1. **Continuous Integration**:
   - Runs on every push to the `main` branch
   - Checks code formatting with Prettier
   - Lints code with ESLint
   - Builds the project
   - Runs tests

2. **Continuous Deployment**:
   - Automatically publishes to GitHub Packages when version changes
   - Creates GitHub releases with appropriate tags
   - Generates release notes based on commit history 