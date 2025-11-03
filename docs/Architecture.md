# Architecture

System architecture and design of the Arduino Web Server.

## Overview

The Arduino Web Server is a Rust-based asynchronous web server that bridges HTTP clients with Arduino hardware via serial communication.

**Stack:**

- **Web Framework**: Axum 0.7
- **Async Runtime**: Tokio 1.38.0
- **Serialization**: Serde 1.0 + serde_json
- **Serial Communication**: serialport 4.2
- **CORS & Static Files**: tower-http 0.5
- **Frontend**: React 19 with TypeScript 4.9

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/JSON
       ↓
┌─────────────────────┐
│   Axum Web Server   │
│   (Port 5000)       │
│                     │
│  ┌──────────────┐   │
│  │   Handlers   │   │
│  └──────┬───────┘   │
│         │           │
│  ┌──────▼───────┐   │
│  │    Serial    │   │
│  └──────────────┘   │
└─────────┬───────────┘
          │ Serial
          ↓
    ┌──────────┐
    │ Arduino  │
    └──────────┘
```

## Module Organization

### src/main.rs

**Purpose:** Application entry point

**Responsibilities:**

1. Initialize Arduino connection
2. Create shared state (`AppState`)
3. Spawn background connection monitor
4. Build HTTP router
5. Start Axum server

**Key Code:**

```rust
#[tokio::main]
async fn main() {
    let arduino_port = connect_arduino().await;
    let state = AppState {
        arduino: Arc::new(Mutex::new(arduino_port)),
    };

    tokio::spawn(async move {
        monitor_arduino_connection(monitor_state).await;
    });

    let app = Router::new()
        .route("/api/update", post(update))
        .route("/api/stop", post(stop))
        .route("/api/led", post(led))
        .route("/api/scan", get(scan))
        .layer(CorsLayer::permissive())
        .with_state(state);
}
```

### src/lib.rs

**Purpose:** Library crate for testing

Exports all modules so integration tests can access internal functionality.

### src/config.rs

**Purpose:** Configuration constants

**Constants:**

- `MANUFACTURER: &str` - Arduino manufacturer name for discovery
- `BAUD_RATE: u32` - Serial baud rate (9600)
- `TIMEOUT: Duration` - Serial operation timeout (1 second)
- `SERVER_PORT: u16` - HTTP server port (5000)
- `RECONNECT_INTERVAL: Duration` - Reconnection check interval (5 seconds)

### src/models/

**state.rs:**

```rust
#[derive(Clone)]
pub struct AppState {
    pub arduino: Arc<Mutex<Option<Box<dyn serialport::SerialPort>>>>,
}
```

- Uses `Arc<Mutex<>>` for thread-safe sharing
- `Option` represents connected/disconnected state

**requests.rs:**

- `UpdateRequest` - Update endpoint payload
- `StopRequest` - Stop endpoint payload
- `LedRequest` - LED endpoint payload

**responses.rs:**

- `SuccessResponse` - Standard success format
- `ErrorResponse` - Standard error format

### src/handlers/

Each handler follows this pattern:

1. Extract state and JSON payload
2. Lock Arduino mutex
3. Check connection status (return 503 if not connected)
4. Format command string
5. Send to Arduino via serial
6. Parse response
7. Return JSON response

**Files:**

- `update.rs` - Handles POST /api/update
- `stop.rs` - Handles POST /api/stop
- `led.rs` - Handles POST /api/led
- `scan.rs` - Handles GET /api/scan

### src/serial/

**connection.rs:**

- `get_com_port()` - Discovers Arduino by manufacturer
- `connect_arduino()` - Establishes serial connection
- `monitor_arduino_connection()` - Background task for auto-reconnect

**communication.rs:**

- `send_data()` - Sends command and reads response
- `read_serial()` - Reads single line from serial port
- `get_all_responses()` - Drains all pending data

### src/utils/

**converters.rs:**

- `hex_to_rgb()` - Converts hex color string to RGB tuple

**formatters.rs:**

- `make_update_string()` - Formats UPDATE command
- `make_led_string()` - Formats LED command
- `format_response()` - Parses Arduino JSON responses

## Data Flow

### Request Flow Example (POST /api/update)

```
1. Client sends POST /api/update with JSON
   ↓
2. Axum routes to handlers::update()
   ↓
3. Extract state and deserialize JSON to UpdateRequest
   ↓
4. Lock arduino mutex (await)
   ↓
5. Check if arduino.is_none() → return 503 if disconnected
   ↓
6. Format command: "UPDATE(1, 100, 50, 30, 1)"
   ↓
7. Call send_data(port, command)
   ↓
8. Write to serial: "<UPDATE(1, 100, 50, 30, 1)>\n"
   ↓
9. Read response from serial
   ↓
10. Check if response starts with "error"
    ↓
11. Return SuccessResponse or ErrorResponse
```

## Concurrency Model

### Async/Await with Tokio

All I/O operations are asynchronous:

- HTTP requests handled concurrently
- Serial communication is blocking but wrapped in async
- Background tasks run independently

### Shared State Management

```rust
Arc<Mutex<Option<Box<dyn serialport::SerialPort>>>>
```

- **Arc**: Allows multiple ownership across async tasks
- **Mutex**: Ensures only one task accesses serial port at a time
- **Option**: Represents connection state
- **Box<dyn>**: Type-erased serial port trait object

**Why Mutex?**
Serial port communication must be sequential - only one command at a time. The mutex ensures exclusive access.

### Background Monitoring

```rust
tokio::spawn(async move {
    monitor_arduino_connection(state).await;
});
```

A separate async task runs in the background:

- Checks connection every 5 seconds
- Attempts reconnection if disconnected
- Runs independently of HTTP requests

## Error Handling

### Strategy

All fallible operations return `Result<T, E>`:

```rust
pub fn send_data(port: &mut Box<dyn SerialPort>, data: &str)
    -> Result<String, String>
```

Handlers convert results to HTTP status codes:

- 200 OK - Success
- 400 Bad Request - Invalid input (e.g., bad color format)
- 500 Internal Server Error - Communication failure
- 503 Service Unavailable - Arduino not connected

### Connection Failure Handling

When Arduino communication fails:

1. Set `*arduino = None` to mark disconnected
2. Return error response to client
3. Background monitor will attempt reconnection

## Testing Architecture

**Test Structure:**

- Unit tests: In-module `#[cfg(test)]` blocks (40 tests)
- Integration tests: `tests/integration_tests.rs` (11 tests)
- End-to-end tests: `tests/e2e_tests.rs` (6 tests)

**Total: 57 tests**

Integration tests use mock router with no Arduino:

```rust
fn create_test_router() -> Router {
    let mock_state = AppState {
        arduino: Arc::new(Mutex::new(None)),  // No Arduino
    };
    Router::new()
        .route("/api/update", post(update))
        // ...
        .with_state(mock_state)
}
```

## Frontend Integration

React app served from `src/frontend/build/`:

- Built with `npm run build`
- Served by Axum via `ServeDir::new("src/frontend/build")`
- Accessible at `http://localhost:5000/`
- API calls go to same server (no CORS issues in production)

## Dependencies

### Core Dependencies

```toml
axum = "0.7"                    # Web framework
tokio = "1.38.0"                # Async runtime
serde = "1.0"                   # Serialization
serde_json = "1.0"              # JSON
tower-http = "0.5"              # CORS, static files
serialport = "4.2"              # Serial communication
```

### Dev Dependencies

```toml
futures = "0.3"                 # For testing
tower = { features = ["util"] } # ServiceExt trait
```

### Unused Dependencies

```toml
pyo3 = "0.21"                   # Python bindings (not currently used)
```

## Performance Considerations

1. **Async I/O**: Non-blocking operations maximize throughput
2. **Single Serial Connection**: One persistent connection, no overhead
3. **Mutex Contention**: Only during serial communication (brief)
4. **Release Build**: Run with `cargo build --release` for production

## Security Considerations

1. **No Authentication**: All endpoints are publicly accessible
2. **Permissive CORS**: Allows all origins (should restrict in production)
3. **Input Validation**: Serde validates JSON structure automatically
4. **Error Messages**: Don't expose internal details
5. **No Rate Limiting**: Should add for production

## Scalability Limitations

Current design supports:

- ✅ Multiple concurrent HTTP requests
- ✅ Single Arduino device
- ❌ Multiple Arduino devices (would need connection pool)
- ❌ Request queuing (uses mutex for serial access)
- ❌ WebSocket support (could add for real-time updates)
