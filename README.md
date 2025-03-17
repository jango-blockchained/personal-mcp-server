# Boilerplate MCP Server

A boilerplate Model Context Protocol (MCP) server implementation using TypeScript. This project demonstrates how to build a well-structured MCP server that exposes both tools and resources to AI applications like Claude Desktop. It serves as a starting point for developers building MCP-compatible servers with a focus on clean architecture, automated workflows, and easy deployment.

## Core Features

- **STDIO MCP Server**: Designed for AI clients like Claude Desktop, providing tools and resources via the Model Context Protocol.
- **CLI Support**: Human-friendly command-line interface for the same functionality, making it easy to test and use directly.
- **IP Address Lookup**: Get details about any IP address or your current device's IP.
- **Automated Release Management**: GitHub Actions workflow for continuous integration, testing, and publishing to GitHub Packages.

## Configuration Options for End Users

Before setting up with Claude Desktop or Cursor AI, you can configure the server. There are two recommended options for end users:

### Option 1: Direct Configuration in Claude/Cursor

Pass your configuration directly in the Claude Desktop config or Cursor AI command:

```json
{
  "mcpServers": {
    "aashari/boilerplate-mcp-server": {
      "command": "npx",
      "args": ["-y", "DEBUG=true", "IPAPI_API_TOKEN=your_token", "aashari/boilerplate-mcp-server"]
    }
  }
}
```

### Option 2: Global Configuration File (Recommended)

1. Create a global configuration file at `$HOME/.mcp/configs.json`:

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

2. Then use a simplified configuration in Claude Desktop or Cursor AI:

```json
{
  "mcpServers": {
    "aashari/boilerplate-mcp-server": {
      "command": "npx",
      "args": ["-y", "aashari/boilerplate-mcp-server"]
    }
  }
}
```

This approach keeps your configuration in one secure location and simplifies your AI assistant setup.

### Available Configuration Options

- **DEBUG**: Set to `true` to enable debug logging.
- **IPAPI_API_TOKEN**: API token for the IP API service (if required).

## Setting Up with Claude Desktop

To use this MCP server with Claude Desktop:

1. **Open Claude Desktop Settings**:

   - Launch Claude Desktop
   - Click on the settings icon (gear) in the top-right corner

   ![Claude Desktop Settings](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/claude-setup-01.png)

2. **Edit MCP Configuration**:

   - Click on "Edit Config" button
   - This will open File Explorer/Finder with the `claude_desktop_config.json` file

3. **Update Configuration File**:

   - Add one of the configuration options from above to the file
   - Save the file

   Example with global configuration file already set up:

   ```json
   {
     "mcpServers": {
       "aashari/boilerplate-mcp-server": {
         "command": "npx",
         "args": ["-y", "aashari/boilerplate-mcp-server"]
       }
     }
   }
   ```

4. **Restart Claude Desktop**:

   - Close and reopen Claude Desktop to apply the changes

   ![Claude Desktop Home](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/claude-setup-02.png)

5. **Verify Tool Availability**:

   - On the Claude home page, look for the hammer icon on the right side
   - Click it to see available tools
   - Ensure the `get-ip-details` tool is listed

   ![Claude Tools Menu](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/claude-setup-03.png)

6. **Test the Tool**:

   - Try asking Claude: "give me my public IP" or "analyze this IP: 8.8.8.8"
   - Claude will use the MCP tool to fetch and display the requested information

   ![Claude Using IP Tool](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/claude-setup-04.png)

## Setting Up with Cursor AI

To use this MCP server with Cursor AI:

1. **Open Cursor Settings**:

   - Launch Cursor
   - Press `CMD + SHIFT + P` (or `CTRL + SHIFT + P` on Windows)
   - Type "settings" and select "Cursor Settings"
   - On the sidebar, select "MCP"

   ![Cursor Settings MCP](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/cursor-setup-01.png)

2. **Add New MCP Server**:

   - Click "+ Add new MCP server"
   - A configuration form will appear

   ![Cursor Add MCP Server](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/cursor-setup-02.png)

3. **Configure MCP Server**:

   - **Name**: Enter `aashari/boilerplate-mcp-server`
   - **Type**: Select `command` from the dropdown
   - **Command**: Choose one of the following based on your configuration approach:

   If using global configuration file (recommended):

   ```
   npx -y aashari/boilerplate-mcp-server
   ```

   If passing configuration directly:

   ```
   DEBUG=true IPAPI_API_TOKEN=your_token npx -y aashari/boilerplate-mcp-server
   ```

   - Click "Add"

4. **Verify Server Configuration**:

   - The server should now be listed with a green indicator
   - You should see the `get_ip_details` tool listed under the server

   ![Cursor MCP Server Listed](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/cursor-setup-04.png)

5. **Test the Tool**:

   - In the chat sidebar, ensure Agent mode is active
   - Try asking: "give me my public IP" or "analyze this IP: 8.8.8.8"
   - Cursor AI will use the MCP tool to fetch and display the requested information

   ![Cursor Using IP Tool](https://raw.githubusercontent.com/aashari/mcp-atlassian-confluence/refs/heads/main/public/cursor-setup-05.png)

## Using as a CLI Tool

The package can also be used as a command-line tool for human interaction:

- **Get help and available commands**:

  ```bash
  npx -y aashari/boilerplate-mcp-server --help
  ```

  Example output:

  ```
  Usage: @aashari/boilerplate-mcp-server [options] [command]

  A boilerplate Model Context Protocol (MCP) server implementation using TypeScript

  Options:
    -V, --version               output the version number
    -h, --help                  display help for command

  Commands:
    get-ip-details [ipAddress]  Get details about a specific IP address or the current device
    help [command]              display help for command
  ```

- **Get current device IP details**:

  ```bash
  npx -y aashari/boilerplate-mcp-server get-ip-details
  ```

  Example output:

  ```
  status: success
  country: Indonesia
  countryCode: ID
  region: JK
  regionName: Jakarta
  city: Jakarta
  zip: 11730
  lat: -6.2114
  lon: 106.8446
  timezone: Asia/Jakarta
  isp: Biznet Wifi
  org:
  as: AS17451 BIZNET NETWORKS
  query: 118.99.106.135
  ```

- **Get details for a specific IP address**:

  ```bash
  npx -y aashari/boilerplate-mcp-server get-ip-details 8.8.8.8
  ```

  Example output:

  ```
  status: success
  country: United States
  countryCode: US
  region: VA
  regionName: Virginia
  city: Ashburn
  zip: 20149
  lat: 39.03
  lon: -77.5
  timezone: America/New_York
  isp: Google LLC
  org: Google Public DNS
  as: AS15169 Google LLC
  query: 8.8.8.8
  ```

---

## About MCP

For detailed information about the Model Context Protocol (MCP), including core concepts, architecture, and implementation guides, please refer to the [official MCP documentation](https://modelcontextprotocol.io/docs/).

## For Developers

If you're interested in developing or extending this project, please refer to the [Development Guide](DEVELOPMENT.md) for detailed information on:

- Prerequisites and installation
- Project structure
- Configuration system
- Adding your own functionality
- Testing and deployment
- Creating your own MCP server
- And more

## License

[ISC](https://opensource.org/licenses/ISC)
