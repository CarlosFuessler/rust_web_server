pub fn hex_to_rgb(hex_color: &str) -> Result<(u8, u8, u8), String> {
    let hex = hex_color.trim_start_matches('#');
    if hex.len() != 6 {
        return Err("Hex color must be 6 digits long".to_string());
    }

    let r = u8::from_str_radix(&hex[0..2], 16).map_err(|e| e.to_string())?;
    let g = u8::from_str_radix(&hex[2..4], 16).map_err(|e| e.to_string())?;
    let b = u8::from_str_radix(&hex[4..6], 16).map_err(|e| e.to_string())?;

    Ok((r, g, b))
}
