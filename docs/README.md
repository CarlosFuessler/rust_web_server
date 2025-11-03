# Arduino Web Server Documentation

Complete documentation for the Rust-based Arduino Web Server project.

## Documentation Index

1. **[API Reference](API-Reference.md)** - REST API endpoints and usage
2. **[Architecture](Architecture.md)** - System design and structure
3. **[Setup Guide](Setup-Guide.md)** - Installation and configuration
4. **[Testing Guide](Testing-Guide.md)** - Running and writing tests

## Quick Start

```bash
# Build and run server
cargo run

# Server starts on http://localhost:5000
```

## Project Overview

This is a Rust web server that provides a REST API for controlling Arduino devices via serial communication. The server automatically discovers and maintains connection with Arduino devices.

### Key Features

- **REST API** - Four endpoints: update, stop, led, scan
- **Auto-Reconnection** - Monitors and reconnects to Arduino automatically
- **React Frontend** - TypeScript-based UI (served from `/`)
- **CORS Enabled** - Configured for cross-origin requests

### Technology Stack

- **Backend**: Rust with Axum 0.7 web framework
- **Runtime**: Tokio 1.38.0 (async)
- **Serial**: serialport 4.2
- **Frontend**: React 19 with TypeScript 4.9
- **Testing**: 57 tests (40 unit + 11 integration + 6 e2e)

## Module Structure

```
src/
├── main.rs              # Entry point, server setup
├── lib.rs               # Library exports for testing
├── config.rs            # Configuration constants
├── models/              # Data structures
│   ├── state.rs         # AppState
│   ├── requests.rs      # Request DTOs
│   └── responses.rs     # Response DTOs
├── handlers/            # API endpoint handlers
│   ├── update.rs        # POST /api/update
│   ├── stop.rs          # POST /api/stop
│   ├── led.rs           # POST /api/led
│   └── scan.rs          # GET /api/scan
├── serial/              # Arduino communication
│   ├── connection.rs    # Connection management
│   └── communication.rs # Send/receive data
└── utils/               # Helpers
    ├── converters.rs    # hex_to_rgb
    └── formatters.rs    # Command formatting
```

## API Endpoints

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| POST   | `/api/update` | Update Arduino parameters |
| POST   | `/api/stop`   | Stop operation            |
| POST   | `/api/led`    | Control LED               |
| GET    | `/api/scan`   | Scan sensors              |

See [API Reference](API-Reference.md) for detailed documentation.

## Configuration

Edit `src/config.rs` to customize:

```rust
pub const MANUFACTURER: &str = "Microsoft";  // Arduino manufacturer
pub const BAUD_RATE: u32 = 9600;            // Serial baud rate
pub const SERVER_PORT: u16 = 5000;          // HTTP port
pub const TIMEOUT: Duration = Duration::from_secs(1);
pub const RECONNECT_INTERVAL: Duration = Duration::from_secs(5);
```

## License

This project is part of a research/educational initiative.
