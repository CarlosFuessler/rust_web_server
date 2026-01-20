# 🔌 Smart Grid Control Panel

Ein professionelles Messeprojekt zur Steuerung eines dynamischen Stromnetzwerks mit umsteckbaren Modulen. Gebaut mit Rust (Axum) Backend und React TypeScript Frontend.

## ✨ Highlights

- **🎨 Industrielles Design**: Glassmorphism UI mit Premium Dark Theme
- **💡 LED-Steuerung**: Echtzeit-Farbsteuerung der Stromnetzwerk-LEDs
- **⚡ Dynamische Module**: Automatische Icon-Erkennung basierend auf Position
- **📱 Responsive**: Optimiert für Desktop, Tablet und Mobile
- **🔄 Live-Updates**: Echtzeit-Visualisierung des Netzwerkstatus
- **⚙️ Arduino-Integration**: Serielle Kommunikation für Hardware-Steuerung

## 🎯 Für die Messe

Dieses Projekt visualisiert und steuert ein physisches Stromnetzwerk mit:
- **Hexagon-Module**: Solar, Wind, Batterie, Generator etc.
- **LED-Verbindungen**: Zeigen Energiefluss mit steuerbaren Farben
- **Haushalte**: Verbrauchssteuerung
- **Umsteckbar**: Module werden automatisch erkannt

### Quick Demo (30 Sekunden)
```bash
1. cargo run --release
2. Browser: http://localhost:8088
3. Klick auf LED-Linie → Farbe wählen → Anwenden
4. ✨ LED leuchtet in gewählter Farbe!
```

## 📚 Dokumentation

### Sofort loslegen
- **[🚀 Quick Start](./docs/QUICK_START.md)** - In 3 Schritten zur Demo
- **[🎤 Messe-Guide](./docs/MESSE_GUIDE.md)** - Präsentations-Scripts & Demo-Szenarien
- **[🎨 UI-Komponenten](./docs/UI_COMPONENTS.md)** - Design System & Komponenten-Referenz

### Vollständige Docs
- **[📋 Frontend Update](./docs/FRONTEND_UPDATE.md)** - Vollständige Feature-Liste
- **[🏗️ Architecture](./docs/Architecture.md)** - System-Design
- **[📡 API Reference](./docs/API-Reference.md)** - REST API Endpoints
- **[⚙️ Setup Guide](./docs/Setup-Guide.md)** - Installation & Konfiguration
- **[🔧 Testing Guide](./docs/Testing-Guide.md)** - Test-Strategien

## 🎨 Screenshots

### Desktop - Hauptansicht
```
┌──────────────────────────────────────────────┐
│  Smart Grid Control    [◑]  🟢 Verbunden    │
├──────────┬───────────────────────────────────┤
│  LED     │         ⬡   ⬡   ⬡                │
│ ┌──────┐ │           ⬡   ⬡                  │
│ │ [🎨]  │ │         ⬡   ⬡   ⬡                │
│ │ ████  │ │                                  │
│ │#3B82F6│ │    Animierte LED-Verbindungen    │
│ └──────┘ │    mit Energy-Flow-Effekten      │
│          │                                   │
│ [→][←]   │         ■  ■  ■  ■               │
│ ━━━●━━   │         ■  ■  ■  ■    Haushalte  │
│          │         ■  ■  ■  ■               │
│          │                                   │
│ [✓ Apply]│                                   │
└──────────┴───────────────────────────────────┘
```

## 🚀 Quick Start

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

## Performance Profiling

### Memory Profiling

```bash
cargo run --release --features dhat-heap --example memory_profile
```

Results saved to `dhat-heap.json`. View at [DHAT Viewer](https://nnethercote.github.io/dh_view/dh_view.html).

### CPU Profiling

```bash
cargo install flamegraph
cargo flamegraph --bin webserver
```

Linux users need `perf`:

```bash
sudo apt-get install linux-tools-$(uname -r)  # Ubuntu/Debian
```

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
