# API Reference

Complete REST API documentation for the Arduino Web Server.

## Base URL

```
http://localhost:5000
```

## Endpoints

### POST /api/update

Update Arduino parameters for power, charge, and timing control.

**Request:**

```http
POST /api/update
Content-Type: application/json

{
  "power": 100,
  "charge": 50,
  "time": 30,
  "eeprom": 1,
  "active": 1
}
```

**Parameters:**

- `power` (integer, required) - Power level
- `charge` (integer, required) - Charge value
- `time` (integer, required) - Time parameter
- `eeprom` (integer, required) - EEPROM slot number
- `active` (integer, optional, default: 1) - Active state (0 or 1)

**Success Response (200):**

```json
{
  "status": "success",
  "sent": "UPDATE(1, 100, 50, 30, 1)",
  "arduino_response": "OK: Updated"
}
```

**Error Responses:**

- `503 Service Unavailable` - Arduino not connected
- `500 Internal Server Error` - Communication failed

---

### POST /api/stop

Stop Arduino operation, optionally saving to EEPROM.

**Request (without EEPROM):**

```http
POST /api/stop
Content-Type: application/json

{}
```

**Request (with EEPROM):**

```http
POST /api/stop
Content-Type: application/json

{
  "eeprom": 1
}
```

**Parameters:**

- `eeprom` (integer, optional) - EEPROM slot to save state

**Success Response (200):**

```json
{
  "status": "success",
  "arduino_response": "OK: Stopped"
}
```

**Error Responses:**

- `503 Service Unavailable` - Arduino not connected
- `500 Internal Server Error` - Communication failed

---

### POST /api/led

Control LED parameters including color, direction, and pulse frequency.

**Request:**

```http
POST /api/led
Content-Type: application/json

{
  "ledID": 1,
  "color": "#FF5733",
  "forward": true,
  "pulseFrequenz": 5
}
```

**Parameters:**

- `ledID` (integer, required) - LED identifier
- `color` (string, required) - Hex color (with or without `#`, e.g., "#FF5733" or "FF5733")
- `forward` (boolean, required) - Direction (true = forward, false = backward)
- `pulseFrequenz` (integer, required) - Pulse frequency in Hz

**Success Response (200):**

```json
{
  "status": "success",
  "message": "LED parameters received",
  "parameters": {
    "ledID": 1,
    "color": [255, 87, 51],
    "forward": true,
    "pulseFrequenz": 5
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid color format
- `503 Service Unavailable` - Arduino not connected
- `500 Internal Server Error` - Communication failed

---

### GET /api/scan

Scan Arduino sensors and retrieve data. Performs up to 3 scans to ensure data consistency.

**Request:**

```http
GET /api/scan
```

**Success Response (200):**

```json
{
  "status": "success",
  "arduino_response": "SCAN: {\"sensor1\": 123}",
  "data": {
    "sensor1": 123,
    "temperature": 25.5
  }
}
```

**No Consistent Data (200):**

```json
{
  "status": "success",
  "arduino_response": "No consistent pair found",
  "data": []
}
```

**Error Responses:**

- `503 Service Unavailable` - Arduino not connected
- `500 Internal Server Error` - Scan failed

**Behavior:**
The scan endpoint performs up to 3 scans:

1. First scan
2. Second scan - if matches first, return data
3. Third scan (if needed) - return any two matching results

---

## Common Response Format

### Success Response Fields

```json
{
  "status": "success",
  "sent": "command sent (optional)",
  "arduino_response": "Arduino response (optional)",
  "message": "message (optional)",
  "parameters": {...},
  "data": {...}
}
```

### Error Response Fields

```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## HTTP Status Codes

| Code | Meaning                                              |
| ---- | ---------------------------------------------------- |
| 200  | Success                                              |
| 400  | Bad Request - Invalid input                          |
| 500  | Internal Server Error - Arduino communication failed |
| 503  | Service Unavailable - Arduino not connected          |

---

## Arduino Protocol

### Command Format

Commands sent to Arduino:

```
<COMMAND(args)>\n
```

### Commands

**UPDATE:**

```
<UPDATE(eeprom, power, charge, time, active)>\n
```

**STOP:**

```
<STOP()>\n
<STOP(eeprom)>\n
```

**LED:**

```
<LED(id, forward, r, g, b, freq)>\n
```

**SCAN:**

```
<SCAN()>\n
```

### Expected Arduino Responses

```
OK: message\n
COMMAND: {json_data}\n
ERROR: message\n
```

---

## CORS

The server uses permissive CORS policy allowing all origins. For production, restrict origins in `src/main.rs`:

```rust
use tower_http::cors::CorsLayer;
use axum::http::Method;

let cors = CorsLayer::new()
    .allow_origin("https://yourdomain.com".parse::<HeaderValue>().unwrap())
    .allow_methods([Method::GET, Method::POST]);
```

---

## Example Requests

### cURL Examples

**Update:**

```bash
curl -X POST http://localhost:5000/api/update \
  -H "Content-Type: application/json" \
  -d '{"power":100,"charge":50,"time":30,"eeprom":1}'
```

**Stop:**

```bash
curl -X POST http://localhost:5000/api/stop \
  -H "Content-Type: application/json" \
  -d '{}'
```

**LED:**

```bash
curl -X POST http://localhost:5000/api/led \
  -H "Content-Type: application/json" \
  -d '{"ledID":1,"color":"#FF5733","forward":true,"pulseFrequenz":5}'
```

**Scan:**

```bash
curl http://localhost:5000/api/scan
```

### JavaScript Example

```javascript
async function updateArduino() {
  const response = await fetch("http://localhost:5000/api/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      power: 100,
      charge: 50,
      time: 30,
      eeprom: 1,
      active: 1,
    }),
  });

  const data = await response.json();
  console.log(data);
}
```
