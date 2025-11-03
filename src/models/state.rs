use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    pub arduino: Arc<Mutex<Option<Box<dyn serialport::SerialPort>>>>,
}
