# WriteDocs CLI

**WriteDocs CLI** is a command-line tool designed to help you manage and run your WriteDocs development environment. It provides easy commands to start your development server, handle API integrations, and more.

## Features

- **Start the WriteDocs development server** with ease.
- **Run API integration tasks** for your documentation projects.
- **User-friendly command-line interface** with helpful prompts and retry logic for common issues, like port conflicts.

## Installation

To install WriteDocs CLI globally, run:

```bash
npm install -g writedocs
```

This command installs the CLI tool globally on your system, making the `writedocs` command available from anywhere in your terminal.

## Usage

After installation, you can use the `writedocs` command followed by the appropriate sub-command to perform various tasks.

### Available Commands

- **`writedocs dev`**  
  Start the WriteDocs development server. This command handles port conflicts and retries automatically.

  ```bash
  writedocs dev
  ```

- **`writedocs api`**  
  Generates endpoint markdown pages from your OpenAPI Specification files.

  ```bash
  writedocs api
  ```

- **`writedocs help`**  
  Display help information, showing available commands and their descriptions.

  ```bash
  writedocs help
  ```

### Example

Starting the development server:

```bash
writedocs dev
```

If port 3000 is in use, the CLI will automatically try the next available port (e.g., 3001, 3002) until it finds an open port.

## Troubleshooting

### Port Conflicts

If you encounter issues with port conflicts (e.g., "Port 3000 is already in use"), the CLI will automatically try the next available port. If it exceeds the maximum number of retries, it will display an error message.

### Exceeding Retries

If the maximum number of retries is exceeded, check your system for conflicting services or manually specify a port by adjusting your environment variables.
