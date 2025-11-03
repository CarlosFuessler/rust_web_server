use crate::config::{BAUD_RATE, MANUFACTURER, RECONNECT_INTERVAL, TIMEOUT};
use crate::models::AppState;
use crate::serial::communication::get_all_responses;
use std::time::Duration;

pub fn get_com_port() -> Option<String> {
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

pub async fn connect_arduino() -> Option<Box<dyn serialport::SerialPort>> {
    let port_name = get_com_port()?;
    println!("Port: {}", port_name);

    match serialport::new(&port_name, BAUD_RATE)
        .timeout(TIMEOUT)
        .open()
    {
        Ok(mut port) => {
            tokio::time::sleep(Duration::from_secs(2)).await;
            get_all_responses(&mut port);
            println!("Arduino connected!");
            Some(port)
        }
        Err(e) => {
            println!("[Error] while connecting with Arduino: {}", e);
            None
        }
    }
}

pub async fn monitor_arduino_connection(state: AppState) {
    loop {
        tokio::time::sleep(RECONNECT_INTERVAL).await;

        let mut arduino = state.arduino.lock().await;
        if arduino.is_none() {
            println!("Try connecting with Arduino...");
            *arduino = connect_arduino().await;
        }
    }
}
