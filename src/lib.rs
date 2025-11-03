//! Arduino Web Server Library
//!
//! This library provides the core functionality for the Arduino Web Server,
//! including models, handlers, serial communication, and utilities.

pub mod config;
pub mod handlers;
pub mod models;
pub mod serial;
pub mod utils;

// Re-export commonly used items
pub use config::*;
pub use models::{
    AppState, ErrorResponse, LedRequest, StopRequest, SuccessResponse, UpdateRequest,
};
