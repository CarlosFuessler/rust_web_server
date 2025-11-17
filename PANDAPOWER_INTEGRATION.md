# PandaPower Integration Guide

## Overview

Dieses Projekt integriert **PandaPower** – eine Python-Bibliothek für Stromnetzsimulationen – mit einem Rust Web Server und React Frontend.

## Architecture

```
┌─────────────────────────────────────────┐
│        React Frontend                   │
│     (GridSimulator Component)            │
└──────────┬──────────────────────────────┘
           │
           ▼ (HTTP REST API)
┌──────────────────────────────────┐
│      Rust Web Server (Axum)      │
│  - /api/grid/create              │
│  - /api/grid/simulate            │
│  - /api/grid/buses               │
│  - /api/grid/lines               │
│  - /api/grid/summary             │
└──────────┬───────────────────────┘
           │
           ▼ (PyO3 Bridge)
┌──────────────────────────────────┐
│    Python (PandaPower)           │
│  src/python/grid_simulator.py    │
│  - Network creation              │
│  - Power flow calculations       │
│  - Results analysis              │
└──────────────────────────────────┘
```

## Setup

### 1. Virtual Environment

```bash
# Navigiere ins Projektverzeichnis
cd /Users/carlos/Documents/MES/Informatik/Q-Phase/fraunhofer/test

# Erstelle Virtual Environment
python3 -m venv pandapower_env

# Aktiviere für Fish Shell
source pandapower_env/bin/activate.fish

# Installiere PandaPower und Dependencies
python3 -m pip install --upgrade pip
python3 -m pip install pandapower pandas numpy scipy matplotlib
```

### 2. Rust Build

```bash
# Build das Rust-Projekt
cargo build --release

# Oder Debug-Build für Entwicklung
cargo build
```

### 3. Frontend Build

```bash
cd src/frontend

# Installiere Node-Dependencies (falls noch nicht geschehen)
npm install

# Baue den React-App
npm run build

# Oder Development-Server
npm start
```

## API Endpoints

### Create Network
**POST** `/api/grid/create`

Erstellt ein neues Testnetwork mit:
- 2 Buses (110 kV)
- 1 externe Grid-Verbindung
- 1 Leitung
- 1 Last

**Response:**
```json
{
  "status": "success",
  "message": "Network created successfully",
  "buses": 2,
  "lines": 1,
  "loads": 1,
  "generators": 0
}
```

### Run Simulation
**POST** `/api/grid/simulate`

Führt Lastflussrechnung auf dem aktuellen Netzwerk durch.

**Response:**
```json
{
  "status": "converged",
  "total_losses_mw": 0.0234,
  "total_losses_mvar": 0.0156,
  "computation_time_ms": 45.23
}
```

### Get Bus Results
**GET** `/api/grid/buses`

Gibt Spannungen und Leistungen an allen Knoten zurück.

**Response:**
```json
{
  "status": "success",
  "buses": [
    {
      "bus_id": 0,
      "bus_name": "Bus_1",
      "vm_pu": 1.0000,
      "va_degree": 0.0,
      "p_mw": 15.234,
      "q_mvar": 5.123
    },
    ...
  ]
}
```

### Get Line Results
**GET** `/api/grid/lines`

Gibt Leistungsflüsse und Auslastungen aller Leitungen zurück.

**Response:**
```json
{
  "status": "success",
  "lines": [
    {
      "line_id": 0,
      "line_name": "Line_1-2",
      "from_bus": 0,
      "to_bus": 1,
      "p_from_mw": 15.234,
      "p_to_mw": 15.210,
      "pl_mw": 0.024,
      "loading_percent": 45.3
    },
    ...
  ]
}
```

### Get Network Summary
**GET** `/api/grid/summary`

Gibt eine Zusammenfassung des Netzwerks und der letzten Simulation zurück.

## Files Overview

### Backend (Rust)
- `src/main.rs` - Server entry point mit Grid-API Routes
- `src/handlers/grid.rs` - Grid simulation handlers (PyO3 integration)
- `src/handlers/mod.rs` - Handler module exports

### Python
- `src/python/grid_simulator.py` - PandaPower wrapper Klasse

### Frontend (React/TypeScript)
- `src/frontend/src/components/GridSimulator.tsx` - Main component
- `src/frontend/src/components/GridSimulator.css` - Styling
- `src/frontend/src/App.tsx` - Updated to include GridSimulator

## Frontend Usage

Die GridSimulator-Komponente bietet folgende Features:

1. **Create Network** - Erstellt ein neues Test-Stromnetz
2. **Run Simulation** - Führt eine Lastflussrechnung durch
3. **Bus Results** - Zeigt Spannungs- und Leistungsergebnisse an
4. **Line Results** - Zeigt Leistungsflüsse und Auslastungen der Leitungen

### Tabs
- **Overview** - Netzwerkkonfiguration und Simulationsergebnisse
- **Buses** - Tabellarische Darstellung der Busresultate
- **Lines** - Tabellarische Darstellung der Leitungsresultate mit Loading-Bar

## Running the Application

```bash
# Terminal 1: Rust Backend starten
cd /Users/carlos/Documents/MES/Informatik/Q-Phase/fraunhofer/test
source pandapower_env/bin/activate.fish
cargo run --release

# Terminal 2: Frontend Development Server (optional)
cd src/frontend
npm start
```

Der Server läuft dann auf: `http://localhost:3000` (oder dem konfigurierten PORT)

## Environment Variables

Optional kannst du folgende Variablen in einer `.env`-Datei setzen:

```bash
# Server
SERVER_PORT=3000

# Python Path (falls nicht automatisch gefunden)
PYTHON_PATH=/path/to/pandapower_env/bin/python3
```

## Troubleshooting

### PyO3 Fehler: "Failed to initialize Python"
- Stelle sicher, dass das venv aktiviert ist: `source pandapower_env/bin/activate.fish`
- Prüfe die Python-Version: `python3 --version` (sollte >= 3.9 sein)

### PandaPower Import Fehler
```bash
# Überprüfe ob PandaPower installiert ist
python3 -m pip list | grep pandapower

# Falls nicht vorhanden:
python3 -m pip install pandapower
```

### Cargo Build Fehler
```bash
# Clean und rebuild
cargo clean
cargo build
```

### Frontend kompiliert nicht
```bash
cd src/frontend
npm install
npm run build
```

## Performance Notes

- Die Lastflussrechnung wird synchron ausgeführt
- Für größere Netzwerke sollte die Berechnung in einen Background-Task verschoben werden
- PandaPower Caching kann für schnellere wiederholte Simulationen implementiert werden

## Erweiterungsmöglichkeiten

1. **Dynamische Netzwerk-Konfiguration** - Custom Networks über API
2. **Graphische Visualisierung** - D3.js oder Cytoscape für Netzwerk-Graphs
3. **Optimierung** - Optimal Power Flow (OPF) statt nur Lastflussrechnung
4. **Multi-User Support** - Mehrere Netzwerke parallel simulieren
5. **Export-Funktionen** - Ergebnisse als CSV/Excel exportieren

## Lizenz und Credits

- **PandaPower**: https://pandapower.readthedocs.io/
- **Axum**: Rust Web Framework
- **PyO3**: Python ↔ Rust Integration
- **React**: Frontend UI
