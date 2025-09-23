# Rust Web Server

A full-stack web application built with Rust (Axum) backend and React TypeScript frontend.

## Features

- **Rust Backend**: Built with Axum web framework for high performance
- **React Frontend**: TypeScript-based React application
- **RESTful API**: Multiple endpoints for different functionalities
- **Static File Serving**: Serves the React build files automatically

## Prerequisites

Before running this project, make sure you have the following installed:

- [Rust](https://rustup.rs/) (latest stable version)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Project Structure

```
rust_web_server/
├── src/
│   ├── main.rs              # Rust backend server
│   └── frontend/            # React frontend
│       ├── src/             # React source files
│       ├── public/          # Static assets
│       └── package.json     # Frontend dependencies
├── Cargo.toml               # Rust dependencies
└── README.md
```

## Quick Start

### Prerequisites

Install `cargo-make` for task automation:

```bash
cargo install cargo-make
```

### Option 1: Using Cargo Make (Recommended)

1. **Clone and navigate to the project:**

   ```bash
   git clone <repository-url>
   cd rust_web_server
   ```

2. **Build everything (backend + frontend):**

   ```bash
   cargo make build-all
   ```

3. **Run the server:**

   ```bash
   cargo make run-server
   ```

4. **Open your browser and visit:**
   ```
   http://127.0.0.1:3020
   ```

### Option 2: Manual Setup

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

If you only want to run the API server without the frontend:

```bash
cargo run
```

This will start the server on `http://127.0.0.1:3020` but won't serve the React frontend.

## API Endpoints

Once the server is running, you can access these endpoints:

### GET `/api`

Returns a welcome message.

**Example:**

```bash
curl http://127.0.0.1:3020/api
```

**Response:**

```
Welcome to the Rust Web Server API!
```

### GET `/api/hello/{name}`

Returns a personalized greeting.

**Example:**

```bash
curl http://127.0.0.1:3020/api/hello/John
```

**Response:**

```
Hello, John!
```

### POST `/api/json`

Accepts JSON data and returns a formatted response.

**Example:**

```bash
curl -X POST http://127.0.0.1:3020/api/json \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "age": 30}'
```

**Response:**

```json
{
  "message": "Hello, Alice! You are 30 years old."
}
```

## Python Integration

The server supports running Python calculations within the Rust backend using PyO3.

### GET `/api/python_calc/{num}`

Runs a Python calculation and returns the result.

**Example:**

```bash
curl http://127.0.0.1:3020/api/python_calc/5
```

**Response:**

```
Power calculation for 5 is 25
```

**Requirements:**

- Python must be installed on the system

## Development

### Cargo Make Tasks

This project uses `cargo-make` as a task runner to automate common development tasks. Here are the available custom tasks:

#### Building

- **`cargo make build-all`** - Build both Rust backend and React frontend
- **`cargo make build-rust`** - Build only the Rust web server
- **`cargo make build-frontend`** - Build only the React frontend (cross-platform)

#### Running

- **`cargo make run-server`** - Build and run the Rust web server
- **`cargo make dev-frontend`** - Start the React development server with hot reload
- **`cargo make dev`** - Start both frontend and backend in development mode (experimental)

#### Testing

- **`cargo make test-all`** - Run all tests (Rust + React)
- **`cargo make test-rust`** - Run only Rust tests
- **`cargo make test-frontend`** - Run only React tests

#### Cleaning

- **`cargo make clean`** - Clean Rust build artifacts
- **`cargo make clean-frontend`** - Clean frontend build artifacts (node_modules, build)
- **`cargo make clean-all`** - Clean all build artifacts

#### Dependencies

- **`cargo make install-frontend-deps`** - Install frontend npm dependencies

#### Listing Tasks

- **`cargo make --list-all-steps`** - List all available tasks (including built-in cargo-make tasks)

### Platform Support

The Makefile.toml is configured to work cross-platform:

- **Windows**: Uses `cmd` with specific Windows paths and commands
- **Linux/Mac**: Uses standard shell commands and npm directly

Example usage on Windows:

```powershell
# PowerShell
cargo make build-all
cargo make run-server
```

Example usage on Linux/Mac:

```bash
# Bash/Zsh
cargo make build-all
cargo make run-server
```

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

- **Server Port**: The server runs on port `3020` by default. You can modify this in `src/main.rs`:

  ```rust
  let addr = SocketAddr::from(([127, 0, 0, 1], 3020));
  ```

- **Static Files**: The server serves React build files from `src/frontend/build`. Make sure to build the frontend before running the server.

## Troubleshooting

### Common Issues

1. **"No such file or directory" when accessing the frontend:**

   - Make sure you've built the React frontend first: `cd src/frontend && npm run build`

2. **Port already in use:**

   - Change the port number in `src/main.rs` or stop the process using port 3020

3. **Compilation errors:**

   - Ensure you have the latest stable Rust version: `rustup update`
   - Clear the build cache: `cargo clean`

4. **Frontend build fails:**
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 16+)

### Logs

The server will display startup information and any errors in the terminal. Look for:

```
Server running at http://127.0.0.1:3020
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

# This project is licensed under the MIT License - see the LICENSE file for details.

# rust_web_webserver

> > > > > > > 01f87efcb53dade1269ab88044b5dd4b6f89d6ad
