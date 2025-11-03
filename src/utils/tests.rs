//! Tests for utility functions

#[cfg(test)]
mod converter_tests {
    use crate::utils::converters::hex_to_rgb;

    #[test]
    fn test_hex_to_rgb_with_hash() {
        let result = hex_to_rgb("#FF5733");
        assert_eq!(result, Ok((255, 87, 51)));
    }

    #[test]
    fn test_hex_to_rgb_without_hash() {
        let result = hex_to_rgb("00FF00");
        assert_eq!(result, Ok((0, 255, 0)));
    }

    #[test]
    fn test_hex_to_rgb_blue() {
        let result = hex_to_rgb("#0000FF");
        assert_eq!(result, Ok((0, 0, 255)));
    }

    #[test]
    fn test_hex_to_rgb_white() {
        let result = hex_to_rgb("FFFFFF");
        assert_eq!(result, Ok((255, 255, 255)));
    }

    #[test]
    fn test_hex_to_rgb_black() {
        let result = hex_to_rgb("#000000");
        assert_eq!(result, Ok((0, 0, 0)));
    }

    #[test]
    fn test_hex_to_rgb_invalid_length() {
        let result = hex_to_rgb("#FFF");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Hex color must be 6 digits long");
    }

    #[test]
    fn test_hex_to_rgb_too_long() {
        let result = hex_to_rgb("#FFFFFFF");
        assert!(result.is_err());
    }

    #[test]
    fn test_hex_to_rgb_invalid_chars() {
        let result = hex_to_rgb("GGGGGG");
        assert!(result.is_err());
    }

    #[test]
    fn test_hex_to_rgb_empty() {
        let result = hex_to_rgb("");
        assert!(result.is_err());
    }

    #[test]
    fn test_hex_to_rgb_lowercase() {
        let result = hex_to_rgb("#ff5733");
        assert_eq!(result, Ok((255, 87, 51)));
    }

    #[test]
    fn test_hex_to_rgb_mixed_case() {
        let result = hex_to_rgb("#Ff5733");
        assert_eq!(result, Ok((255, 87, 51)));
    }
}

#[cfg(test)]
mod formatter_tests {
    use crate::utils::formatters::{format_response, make_led_string, make_update_string};

    #[test]
    fn test_make_update_string() {
        let result = make_update_string(100, 50, 30, 1, 1);
        assert_eq!(result, "UPDATE(1, 100, 50, 30, 1)");
    }

    #[test]
    fn test_make_update_string_zeros() {
        let result = make_update_string(0, 0, 0, 0, 0);
        assert_eq!(result, "UPDATE(0, 0, 0, 0, 0)");
    }

    #[test]
    fn test_make_update_string_large_values() {
        let result = make_update_string(255, 255, 9999, 10, 1);
        assert_eq!(result, "UPDATE(10, 255, 255, 9999, 1)");
    }

    #[test]
    fn test_make_led_string() {
        let result = make_led_string(1, (255, 87, 51), true, 5);
        assert_eq!(result, "LED(1, 1, 255, 87, 51, 5)");
    }

    #[test]
    fn test_make_led_string_backward() {
        let result = make_led_string(2, (0, 255, 0), false, 10);
        assert_eq!(result, "LED(2, 0, 0, 255, 0, 10)");
    }

    #[test]
    fn test_make_led_string_zero_freq() {
        let result = make_led_string(1, (255, 255, 255), true, 0);
        assert_eq!(result, "LED(1, 1, 255, 255, 255, 0)");
    }

    #[test]
    fn test_format_response_valid() {
        let response = "SCAN: {\"temperature\": 25.5, \"humidity\": 60}";
        let result = format_response(response);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert_eq!(json["temperature"], 25.5);
        assert_eq!(json["humidity"], 60);
    }

    #[test]
    fn test_format_response_simple() {
        let response = "DATA: {\"value\": 123}";
        let result = format_response(response);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert_eq!(json["value"], 123);
    }

    #[test]
    fn test_format_response_no_colon() {
        let response = "INVALID";
        let result = format_response(response);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Invalid response format");
    }

    #[test]
    fn test_format_response_invalid_json() {
        let response = "DATA: {invalid json}";
        let result = format_response(response);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("JSON parse error"));
    }

    #[test]
    fn test_format_response_empty_json() {
        let response = "DATA: {}";
        let result = format_response(response);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json.is_object());
    }

    #[test]
    fn test_format_response_array() {
        let response = "DATA: [1, 2, 3]";
        let result = format_response(response);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json.is_array());
    }
}
