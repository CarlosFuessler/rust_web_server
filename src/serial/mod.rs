pub mod communication;
pub mod connection;

pub use communication::send_data;
pub use connection::{connect_arduino, monitor_arduino_connection};
