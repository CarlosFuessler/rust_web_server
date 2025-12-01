//! Arduino Web Server
//!
//! A high-performance web server for controlling Arduino devices via serial communication.
//!
//! # Features
//!
//! - REST API for Arduino control (update, stop, LED, scan)
//! - Automatic connection monitoring and reconnection
//! - CORS-enabled for frontend integration
//! - Static file serving for React frontend
//!
//! # Architecture
//!
//! The application is organized into modules:
//! - `config` - Configuration constants
//! - `models` - Data structures (state, requests, responses)
//! - `handlers` - API endpoint implementations
//! - `serial` - Serial communication with Arduino
//! - `utils` - Helper functions

mod config;
mod handlers;
mod models;
mod serial;
mod utils;

use axum::{
    routing::{get, post},
    Router,
};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::Mutex;
use tower_http::{cors::CorsLayer, services::ServeDir};

use config::SERVER_PORT;
use handlers::{led, scan, stop, update};
use models::AppState;
use serial::{connect_arduino, monitor_arduino_connection};

/// Main entry point for the Arduino Web Server.
///
/// This function:
/// 1. Initializes Arduino serial connection
/// 2. Creates shared application state
/// 3. Spawns background connection monitoring task
/// 4. Builds HTTP router with API endpoints
/// 5. Starts the HTTP server
///
/// # Panics
///
/// Panics if the server fails to bind to the configured port.
#[tokio::main]
async fn main() {
    // Initialize Arduino connection
    let arduino_port = connect_arduino().await;
    let state = AppState {
        arduino: Arc::new(Mutex::new(arduino_port)),
    };

    // Start connection monitor in background
    // This task continuously checks the Arduino connection and attempts
    // to reconnect if the connection is lost
    let monitor_state = state.clone();
    tokio::spawn(async move {
        monitor_arduino_connection(monitor_state).await;
    });

    // Build router with API endpoints
    let app = Router::new()
        .route("/api/update", post(update))
        .route("/api/stop", post(stop))
        .route("/api/led", post(led))
        .route("/api/scan", get(scan))
        .layer(CorsLayer::permissive()) // Enable CORS for frontend
        .with_state(state)
        .nest_service("/", ServeDir::new("src/frontend/build")); // Serve React app

    let addr = SocketAddr::from(([0, 0, 0, 0], SERVER_PORT));
    println!("Server running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
