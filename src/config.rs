use std::time::Duration;

pub const MANUFACTURER: &str = "Microsoft";
pub const BAUD_RATE: u32 = 9600;
pub const TIMEOUT: Duration = Duration::from_secs(1);
pub const SERVER_PORT: u16 = 5000;
pub const RECONNECT_INTERVAL: Duration = Duration::from_secs(5);
