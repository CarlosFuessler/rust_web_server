# Setup Guide

Complete installation and setup instructions for the Arduino Web Server.

## Prerequisites

### Required Software

**1. Rust (1.70 or higher)**

```bash
# Install via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify
rustc --version
cargo --version
```

**2. Node.js (16 or higher)**

```bash
# Download from https://nodejs.org/

# Verify
node --version
npm --version
```

**3. Arduino IDE** (for programming Arduino)

- Download from https://www.arduino.cc/en/software

### Hardware

- Arduino board (Uno, Mega, Nano, etc.)
- USB cable
- Computer with USB port

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/CarlosFuessler/rust_web_server.git
cd rust_web_server
```

### 2. Build Rust Server

```bash
cargo build
```

This downloads and compiles all dependencies. First build takes several minutes.

### 3. Build Frontend

```bash
cd src/frontend
npm install
npm run build
cd ../..
```

This creates `src/frontend/build/` with the React app.

## Configuration

### Server Configuration

Edit `src/config.rs`:

```rust
// Arduino manufacturer name for device discovery
pub const MANUFACTURER: &str = "Microsoft";

// Serial baud rate (must match Arduino sketch)
pub const BAUD_RATE: u32 = 9600;

// Serial timeout
pub const TIMEOUT: Duration = Duration::from_secs(1);

// HTTP server port
pub const SERVER_PORT: u16 = 5000;

// Reconnection check interval
pub const RECONNECT_INTERVAL: Duration = Duration::from_secs(5);
```

### Finding Your Arduino Manufacturer

**Windows:**

```powershell
Get-WmiObject Win32_SerialPort | Select-Object Name, Manufacturer
```

**Linux:**

```bash
udevadm info -a -n /dev/ttyUSB0 | grep manufacturer
```

**macOS:**

```bash
system_profiler SPUSBDataType
```

Common manufacturers:

- `"Microsoft"` - Generic USB serial on Windows
- `"Arduino"` - Official Arduino boards
- `"FTDI"` - FTDI chips
- `"CH340"` - CH340 chips

## Arduino Setup

### 1. Upload Arduino Sketch

Your Arduino must understand the command protocol. Example sketch:

```cpp
String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);  // Match BAUD_RATE in config.rs
  inputString.reserve(200);
}

void loop() {
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '<') {
      inputString = "";
    } else if (inChar == '>') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

void processCommand(String cmd) {
  if (cmd.startsWith("UPDATE(")) {
    // Parse: UPDATE(eeprom, power, charge, time, active)
    Serial.println("OK: Updated");
  }
  else if (cmd.startsWith("STOP")) {
    Serial.println("OK: Stopped");
  }
  else if (cmd.startsWith("LED(")) {
    // Parse: LED(id, forward, r, g, b, freq)
    Serial.println("OK: LED set");
  }
  else if (cmd.startsWith("SCAN()")) {
    Serial.print("SCAN: ");
    Serial.println("{\"sensor1\": 123, \"temp\": 25.5}");
  }
  else {
    Serial.println("ERROR: Unknown command");
  }
}
```

### 2. Verify Serial Port

**Windows:**
Check Device Manager → Ports (COM & LPT)

**Linux:**

```bash
ls -l /dev/ttyUSB* /dev/ttyACM*
```

**macOS:**

```bash
ls -l /dev/tty.*
```

## Running the Server

### Development Mode

```bash
cargo run
```

**Expected Output:**

```
Port: COM3
Arduino erfolgreich verbunden!
Server running at http://0.0.0.0:5000
```

### Production Mode

```bash
# Build optimized binary
cargo build --release

# Run
./target/release/webserver      # Linux/macOS
.\target\release\webserver.exe  # Windows
```

### Run with Auto-Reload (Development)

```bash
# Install cargo-watch
cargo install cargo-watch

# Run with auto-reload on code changes
cargo watch -x run
```

## Frontend Setup

### Development Server

Run frontend separately with hot reload:

```bash
cd src/frontend
npm start
```

Starts on `http://localhost:3000` with API proxy to `:5000`.

### Production Build

```bash
cd src/frontend
npm run build
```

Build output in `src/frontend/build/` is served by Rust server at `http://localhost:5000/`.

## Verification

### 1. Test Server

```bash
curl http://localhost:5000/api/scan
```

**With Arduino:**

```json
{
  "status": "success",
  "arduino_response": "...",
  "data": {...}
}
```

**Without Arduino:**

```json
{
  "status": "error",
  "message": "Arduino not connected - no port available"
}
```

### 2. Test Frontend

Open `http://localhost:5000` in browser. You should see the React app.

### 3. Test API Endpoints

```bash
# Update
curl -X POST http://localhost:5000/api/update -H "Content-Type: application/json" -d '{"power":100,"charge":50,"time":30,"eeprom":1}'

# Stop
curl -X POST http://localhost:5000/api/stop -H "Content-Type: application/json" -d '{}'

# LED
curl -X POST http://localhost:5000/api/led -H "Content-Type: application/json" -d '{"ledID":1,"color":"#FF5733","forward":true,"pulseFrequenz":5}'
```

## Common Issues

### "Arduino not connected"

**Solution:**

1. Check USB cable is connected
2. Verify Arduino is powered
3. Check `MANUFACTURER` in `config.rs` matches your device
4. **Linux:** Add user to dialout group:
   ```bash
   sudo usermod -a -G dialout $USER
   # Logout and login
   ```

### "Port already in use"

**Solution:**

1. Change `SERVER_PORT` in `config.rs`, or
2. Kill process using port:

   ```bash
   # Linux/macOS
   lsof -i :5000
   kill -9 <PID>

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Frontend not loading

**Solution:**

1. Build frontend: `cd src/frontend && npm run build`
2. Verify `src/frontend/build/` exists
3. Check browser console for errors

### Compilation errors

**Solution:**

```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean
cargo build
```

**Linux - missing dependencies:**

```bash
sudo apt-get install build-essential pkg-config libudev-dev
```

**Windows - missing build tools:**
Install Visual Studio Build Tools

## Running Tests

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_hex_to_rgb
```

See [Testing Guide](Testing-Guide.md) for details.

## Next Steps

- Read [API Reference](API-Reference.md) for endpoint details
- See [Architecture](Architecture.md) for system design
- Check [Testing Guide](Testing-Guide.md) for testing info
