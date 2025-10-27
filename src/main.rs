use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serialport;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tokio::sync::Mutex;
use tower_http::{cors::CorsLayer, services::ServeDir};

const MANUFACTURER: &str = "Microsoft";
const BAUD_RATE: u32 = 9600;
const TIMEOUT: Duration = Duration::from_secs(1);

// Application State
#[derive(Clone)]
struct AppState {
    arduino: Arc<Mutex<Option<Box<dyn serialport::SerialPort>>>>,
}

// Request/Response DTOs
#[derive(Deserialize, Debug)]
struct UpdateRequest {
    power: i32,
    charge: i32,
    time: i32,
    eeprom: i32,
    #[serde(default = "default_active")]
    active: i32,
}

fn default_active() -> i32 {
    1
}

#[derive(Deserialize, Debug)]
struct StopRequest {
    eeprom: Option<i32>,
}

#[derive(Deserialize, Debug)]
struct LedRequest {
    #[serde(rename = "ledID")]
    led_id: i32,
    color: String, // hex color
    forward: bool,
    #[serde(rename = "pulseFrequenz")]
    pulse_frequenz: i32,
}

#[derive(Serialize)]
struct SuccessResponse {
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    sent: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    arduino_response: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    parameters: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct ErrorResponse {
    status: String,
    message: String,
}

#[tokio::main]
async fn main() {
    // Initialize Arduino connection
    let arduino_port = connect_arduino().await;
    let state = AppState {
        arduino: Arc::new(Mutex::new(arduino_port)),
    };

    // Start connection monitor in background
    let monitor_state = state.clone();
    tokio::spawn(async move {
        monitor_arduino_connection(monitor_state).await;
    });

    // Build router
    let app = Router::new()
        .route("/api/update", post(update))
        .route("/api/stop", post(stop))
        .route("/api/led", post(led))
        .route("/api/scan", get(scan))
        .layer(CorsLayer::permissive())
        .with_state(state)
        .nest_service("/", ServeDir::new("src/frontend/build"));

    let addr = SocketAddr::from(([0, 0, 0, 0], 5000));
    println!("Server running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Serial Communication Functions
fn get_com_port() -> Option<String> {
    let ports = serialport::available_ports().ok()?;
    for port in ports {
        if let serialport::SerialPortType::UsbPort(info) = &port.port_type {
            if let Some(manufacturer) = &info.manufacturer {
                if manufacturer == MANUFACTURER {
                    return Some(port.port_name);
                }
            }
        }
    }
    None
}

async fn connect_arduino() -> Option<Box<dyn serialport::SerialPort>> {
    let port_name = get_com_port()?;
    println!("Port: {}", port_name);

    match serialport::new(&port_name, BAUD_RATE)
        .timeout(TIMEOUT)
        .open()
    {
        Ok(mut port) => {
            tokio::time::sleep(Duration::from_secs(2)).await;
            get_all_responses(&mut port);
            println!("Arduino erfolgreich verbunden!");
            Some(port)
        }
        Err(e) => {
            println!("Fehler beim Verbinden mit Arduino: {}", e);
            None
        }
    }
}

async fn monitor_arduino_connection(state: AppState) {
    loop {
        tokio::time::sleep(Duration::from_secs(5)).await;

        let mut arduino = state.arduino.lock().await;
        if arduino.is_none() {
            println!("Versuche Arduino-Wiederverbindung...");
            *arduino = connect_arduino().await;
        }
    }
}

fn send_data(port: &mut Box<dyn serialport::SerialPort>, data: &str) -> Result<String, String> {
    let message = format!("<{}>\n", data);
    port.write_all(message.as_bytes())
        .map_err(|e| format!("Fehler beim Senden: {}", e))?;

    std::thread::sleep(Duration::from_millis(100));
    read_serial(port, false)
}

fn get_all_responses(port: &mut Box<dyn serialport::SerialPort>) -> String {
    let mut response = String::new();
    let mut buffer = [0u8; 1024];

    loop {
        match port.read(&mut buffer) {
            Ok(n) if n > 0 => {
                if let Ok(line) = String::from_utf8(buffer[..n].to_vec()) {
                    response.push_str(&line);
                }
                std::thread::sleep(Duration::from_millis(100));
            }
            _ => break,
        }
    }
    response
}

fn read_serial(
    port: &mut Box<dyn serialport::SerialPort>,
    print_response: bool,
) -> Result<String, String> {
    let mut buffer = Vec::new();
    let mut temp_buf = [0u8; 1];

    loop {
        match port.read(&mut temp_buf) {
            Ok(n) if n > 0 => {
                buffer.push(temp_buf[0]);
                if temp_buf[0] == b'\n' {
                    let line = String::from_utf8_lossy(&buffer).to_string();
                    if print_response {
                        println!("Got from Arduino: {}", line);
                    }
                    return Ok(line.trim().to_string());
                }
            }
            Ok(_) => continue,
            Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {
                if !buffer.is_empty() {
                    return Ok(String::from_utf8_lossy(&buffer).trim().to_string());
                }
                return Err("Timeout".to_string());
            }
            Err(e) => return Err(format!("Fehler beim Lesen: {}", e)),
        }
    }
}

// Helper Functions
fn make_update_string(power: i32, charge: i32, time: i32, eeprom: i32, active: i32) -> String {
    format!(
        "UPDATE({}, {}, {}, {}, {})",
        eeprom, power, charge, time, active
    )
}

fn make_led_string(led_id: i32, color: (u8, u8, u8), forward: bool, pulse_frequenz: i32) -> String {
    format!(
        "LED({}, {}, {}, {}, {}, {})",
        led_id, forward as i32, color.0, color.1, color.2, pulse_frequenz
    )
}

fn hex_to_rgb(hex_color: &str) -> Result<(u8, u8, u8), String> {
    let hex = hex_color.trim_start_matches('#');
    if hex.len() != 6 {
        return Err("Hex color must be 6 digits long".to_string());
    }

    let r = u8::from_str_radix(&hex[0..2], 16).map_err(|e| e.to_string())?;
    let g = u8::from_str_radix(&hex[2..4], 16).map_err(|e| e.to_string())?;
    let b = u8::from_str_radix(&hex[4..6], 16).map_err(|e| e.to_string())?;

    Ok((r, g, b))
}

fn format_response(response: &str) -> Result<serde_json::Value, String> {
    let parts: Vec<&str> = response.splitn(2, ':').collect();
    if parts.len() < 2 {
        return Err("Invalid response format".to_string());
    }

    serde_json::from_str(parts[1]).map_err(|e| format!("JSON parse error: {}", e))
}

// API Handlers
async fn update(
    State(state): State<AppState>,
    Json(payload): Json<UpdateRequest>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut arduino = state.arduino.lock().await;

    if arduino.is_none() {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                status: "error".to_string(),
                message: "Arduino not connected - no port available".to_string(),
            }),
        ));
    }

    println!("{:?}", payload);

    let data_string = make_update_string(
        payload.power,
        payload.charge,
        payload.time,
        payload.eeprom,
        payload.active,
    );

    let port = arduino.as_mut().unwrap();
    match send_data(port, &data_string) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: Some(data_string),
                arduino_response: Some(response),
                message: None,
                parameters: None,
                data: None,
            }))
        }
        Ok(_) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino".to_string(),
                }),
            ))
        }
        Err(e) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    }
}

async fn stop(
    State(state): State<AppState>,
    Json(payload): Json<Option<StopRequest>>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut arduino = state.arduino.lock().await;

    if arduino.is_none() {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                status: "error".to_string(),
                message: "Arduino not connected - no port available".to_string(),
            }),
        ));
    }

    let command = match payload {
        Some(req) if req.eeprom.is_some() => format!("STOP({})", req.eeprom.unwrap()),
        _ => "STOP()".to_string(),
    };

    let port = arduino.as_mut().unwrap();
    match send_data(port, &command) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: None,
                arduino_response: Some(response),
                message: None,
                parameters: None,
                data: None,
            }))
        }
        Ok(_) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino".to_string(),
                }),
            ))
        }
        Err(e) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    }
}

async fn led(
    State(state): State<AppState>,
    Json(payload): Json<LedRequest>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut arduino = state.arduino.lock().await;

    if arduino.is_none() {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                status: "error".to_string(),
                message: "Arduino not connected - no port available".to_string(),
            }),
        ));
    }

    println!("{:?}", payload);

    let rgb_color = match hex_to_rgb(&payload.color) {
        Ok(color) => color,
        Err(e) => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    };

    let data_string = make_led_string(
        payload.led_id,
        rgb_color,
        payload.forward,
        payload.pulse_frequenz,
    );

    let port = arduino.as_mut().unwrap();
    match send_data(port, &data_string) {
        Ok(response) if !response.to_lowercase().starts_with("error") => {
            Ok(Json(SuccessResponse {
                status: "success".to_string(),
                sent: None,
                arduino_response: None,
                message: Some("LED parameters received".to_string()),
                parameters: Some(serde_json::json!({
                    "ledID": payload.led_id,
                    "color": rgb_color,
                    "forward": payload.forward,
                    "pulseFrequenz": payload.pulse_frequenz,
                })),
                data: None,
            }))
        }
        Ok(_) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino".to_string(),
                }),
            ))
        }
        Err(e) => {
            *arduino = None;
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: e,
                }),
            ))
        }
    }
}

async fn scan(
    State(state): State<AppState>,
) -> Result<Json<SuccessResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut arduino = state.arduino.lock().await;

    if arduino.is_none() {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ErrorResponse {
                status: "error".to_string(),
                message: "Arduino not connected - no port available".to_string(),
            }),
        ));
    }

    let port = arduino.as_mut().unwrap();

    // First scan
    let response1 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on first scan".to_string(),
                }),
            ));
        }
    };

    let formatted1 = format_response(&response1).ok();
    tokio::time::sleep(Duration::from_millis(100)).await;

    // Second scan
    let response2 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on second scan".to_string(),
                }),
            ));
        }
    };

    let formatted2 = format_response(&response2).ok();

    // Compare first two scans
    if formatted1 == formatted2 {
        return Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response1.clone()),
            message: None,
            parameters: None,
            data: formatted1,
        }));
    }

    // Third scan if different
    let response3 = match send_data(port, "SCAN()") {
        Ok(r) if !r.to_lowercase().starts_with("error") => r,
        Ok(_) | Err(_) => {
            *arduino = None;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    status: "error".to_string(),
                    message: "No response from Arduino on third scan".to_string(),
                }),
            ));
        }
    };

    let formatted3 = format_response(&response3).ok();

    // Check for pairs
    if formatted1 == formatted3 {
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response1),
            message: None,
            parameters: None,
            data: formatted1,
        }))
    } else if formatted2 == formatted3 {
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some(response2),
            message: None,
            parameters: None,
            data: formatted2,
        }))
    } else {
        // No consistent pair found
        Ok(Json(SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: Some("No consistent pair found".to_string()),
            message: None,
            parameters: None,
            data: Some(serde_json::json!([])),
        }))
    }
}
