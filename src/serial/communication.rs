use std::time::Duration;

pub fn send_data(port: &mut Box<dyn serialport::SerialPort>, data: &str) -> Result<String, String> {
    let message = format!("<{}>\n", data);
    port.write_all(message.as_bytes())
        .map_err(|e| format!("Fehler beim Senden: {}", e))?;

    std::thread::sleep(Duration::from_millis(100));
    read_serial(port, false)
}

pub fn get_all_responses(port: &mut Box<dyn serialport::SerialPort>) -> String {
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

pub fn read_serial(
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
