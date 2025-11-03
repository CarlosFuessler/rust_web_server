pub fn make_update_string(power: i32, charge: i32, time: i32, eeprom: i32, active: i32) -> String {
    format!(
        "UPDATE({}, {}, {}, {}, {})",
        eeprom, power, charge, time, active
    )
}

pub fn make_led_string(
    led_id: i32,
    color: (u8, u8, u8),
    forward: bool,
    pulse_frequenz: i32,
) -> String {
    format!(
        "LED({}, {}, {}, {}, {}, {})",
        led_id, forward as i32, color.0, color.1, color.2, pulse_frequenz
    )
}

pub fn format_response(response: &str) -> Result<serde_json::Value, String> {
    let parts: Vec<&str> = response.splitn(2, ':').collect();
    if parts.len() < 2 {
        return Err("Invalid response format".to_string());
    }

    serde_json::from_str(parts[1]).map_err(|e| format!("JSON parse error: {}", e))
}
