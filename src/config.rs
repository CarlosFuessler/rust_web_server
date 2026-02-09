//! Configuration constants for the Arduino Web Server.
//!
//! This module contains all configurable constants used throughout the application.
//! Modify these values to customize the server behavior.

use std::time::Duration;

/// Arduino manufacturer name used for device discovery.
///
/// This string is matched against the manufacturer field of USB serial devices
/// to identify the correct Arduino port. Automatically set based on the operating system:
/// - Windows: `"Microsoft"`
/// - Linux: `"Arduino"`
#[cfg(target_os = "windows")]
pub const MANUFACTURER: &str = "Microsoft";

#[cfg(target_os = "linux")]
pub const MANUFACTURER: &str = "Arduino";

/// Serial communication baud rate.
///
/// This must match the baud rate configured in the Arduino sketch.
/// Common values: 9600 (reliable), 57600 (fast), 115200 (fastest).
pub const BAUD_RATE: u32 = 9600;

/// Serial port read/write timeout duration.
///
/// Operations that take longer than this will return a timeout error.
pub const TIMEOUT: Duration = Duration::from_secs(1);

/// HTTP server port number.
///
/// The web server will listen on this port for incoming connections.
pub const SERVER_PORT: u16 = 5000;

/// Interval between Arduino reconnection attempts.
///
/// The background monitor task checks the connection status at this interval
/// and attempts to reconnect if disconnected.
pub const RECONNECT_INTERVAL: Duration = Duration::from_secs(5);