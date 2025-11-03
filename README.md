# Arduino Web Server

A high-performance web server for controlling Arduino devices via serial communication, built with Rust (Axum) backend and React TypeScript frontend.

## Features

- **Serial Communication**: Direct communication with Arduino devices
- **REST API**: HTTP endpoints for device control (update, stop, LED, scan)
- **Auto-Reconnection**: Automatic Arduino connection monitoring
- **React Frontend**: Modern TypeScript-based UI
- **CORS Enabled**: Cross-origin resource sharing support
- **Type-Safe**: Leverages Rust's type system for reliability

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Architecture](./docs/Architecture.md)** - System design and module overview
- **[API Reference](./docs/API-Reference.md)** - Complete API endpoint documentation
- **[Setup Guide](./docs/Setup-Guide.md)** - Installation and configuration
- **[Module Guide](./docs/Module-Guide.md)** - Detailed code module documentation
- **[Development Guide](./docs/Development-Guide.md)** - Contributing and extending
- **[Troubleshooting](./docs/Troubleshooting.md)** - Common issues and solutions

## Prerequisites

Before running this project, make sure you have the following installed:

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Project Structure

```
rust_web_server/
├── src/
│   ├── main.rs              # Application entry point
│   ├── config.rs            # Configuration constants
│   ├── models/              # Data structures (DTOs, state)
│   ├── handlers/            # API route handlers
│   ├── serial/              # Serial communication layer
│   ├── utils/               # Helper functions
│   └── frontend/            # React TypeScript application
├── docs/                    # Comprehensive documentation
├── Cargo.toml               # Rust dependencies
└── README.md                # This file
```

## Quick Start

### Option 1: Run with Frontend (Recommended)

1. **Clone and navigate to the project:**

   ```bash
   git clone <repository-url>
   cd rust_web_server
   ```

2. **Install frontend dependencies:**

   ```bash
   cd src/frontend
   npm install
   ```

3. **Build the React frontend:**

   ```bash
   npm run build
   ```

4. **Return to project root and start the server:**

   ```bash
   cd ../..
   cargo run
   ```

5. **Open your browser and visit:**
   ```
   http://127.0.0.1:3020
   ```

### Option 2: Backend Only

If you only want to run the API server without the frontend:

```bash
cargo run
```

This will start the server on `http://127.0.0.1:3020` but won't serve the React frontend.

## API Endpoints

The server provides the following REST API endpoints (default port: 5000):

### POST `/api/update`

Update Arduino parameters (power, charge, time, EEPROM).

### POST `/api/stop`

Stop Arduino operation, optionally saving to EEPROM.

### POST `/api/led`

Control LED parameters (color, direction, pulse frequency).

### GET `/api/scan`

Scan for Arduino devices and retrieve sensor data.

**For detailed API documentation with examples, see [API Reference](./docs/API-Reference.md).**

## Development

### Frontend Development

To work on the React frontend with hot reload:

1. **Start the React development server:**

   ```bash
   cd src/frontend
   npm start
   ```

   This will start the frontend on `http://localhost:3000`

2. **In another terminal, start the Rust backend:**

   ```bash
   cargo run
   ```

3. **Configure proxy (if needed):**
   The React dev server can proxy API calls to the Rust backend. Add this to `src/frontend/package.json`:
   ```json
   "proxy": "http://127.0.0.1:3020"
   ```

### Backend Development

The Rust server supports hot reload with `cargo watch`:

1. **Install cargo-watch:**

   ```bash
   cargo install cargo-watch
   ```

2. **Run with auto-reload:**
   ```bash
   cargo watch -x run
   ```

## Building for Production

### Frontend

```bash
cd src/frontend
npm run build
```

### Backend

```bash
cargo build --release
```

The production binary will be located at `target/release/webserver.exe` (Windows) or `target/release/webserver` (Unix).

## Configuration

Server configuration is centralized in `src/config.rs`:

```rust
pub const MANUFACTURER: &str = "Microsoft";  // Arduino manufacturer
pub const BAUD_RATE: u32 = 9600;            // Serial baud rate
pub const SERVER_PORT: u16 = 5000;          // HTTP server port
pub const RECONNECT_INTERVAL: Duration = Duration::from_secs(5);
```

**For detailed configuration options, see [Setup Guide](./docs/Setup-Guide.md).**

## Troubleshooting

### Quick Fixes

1. **Arduino Not Connected:**

   - Check USB cable connection
   - Verify manufacturer setting in `config.rs`
   - Linux: Add user to dialout group: `sudo usermod -a -G dialout $USER`

2. **Port Already in Use:**

   - Change `SERVER_PORT` in `config.rs`
   - Or kill process: `lsof -i :5000` (Linux/macOS) or `netstat -ano | findstr :5000` (Windows)

3. **Frontend Not Loading:**

   - Build frontend: `cd src/frontend && npm run build`
   - Verify `src/frontend/build/` exists

4. **Compilation Errors:**
   - Update Rust: `rustup update`
   - Clean build: `cargo clean && cargo build`

**For comprehensive troubleshooting, see [Troubleshooting Guide](./docs/Troubleshooting.md).**

## Contributing

We welcome contributions! Please see our [Development Guide](./docs/Development-Guide.md) for:

- Development setup
- Code style guidelines
- Testing strategies
- Pull request process

**Quick Start:**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run checks: `cargo test && cargo clippy && cargo fmt`
5. Submit Pull Request

## License

This project is part of a research/educational initiative.

## Support & Resources

- **Documentation**: See [`docs/`](./docs/) directory
- **Issues**: [GitHub Issues](https://github.com/CarlosFuessler/rust_web_server/issues)
- **API Reference**: [docs/API-Reference.md](./docs/API-Reference.md)
- **Examples**: See [docs/Development-Guide.md](./docs/Development-Guide.md)
