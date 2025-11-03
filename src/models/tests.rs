//! Tests for request and response models

#[cfg(test)]
mod tests {
    use serde_json::json;

    #[test]
    fn test_update_request_deserialization() {
        let json_str = r#"{
            "power": 100,
            "charge": 50,
            "time": 30,
            "eeprom": 1,
            "active": 1
        }"#;

        let request: Result<crate::models::UpdateRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());

        let request = request.unwrap();
        assert_eq!(request.power, 100);
        assert_eq!(request.charge, 50);
        assert_eq!(request.time, 30);
        assert_eq!(request.eeprom, 1);
        assert_eq!(request.active, 1);
    }

    #[test]
    fn test_update_request_default_active() {
        let json_str = r#"{
            "power": 100,
            "charge": 50,
            "time": 30,
            "eeprom": 1
        }"#;

        let request: Result<crate::models::UpdateRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());

        let request = request.unwrap();
        assert_eq!(request.active, 1); // Should default to 1
    }

    #[test]
    fn test_stop_request_with_eeprom() {
        let json_str = r#"{"eeprom": 5}"#;

        let request: Result<crate::models::StopRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());

        let request = request.unwrap();
        assert_eq!(request.eeprom, Some(5));
    }

    #[test]
    fn test_stop_request_without_eeprom() {
        let json_str = r#"{}"#;

        let request: Result<crate::models::StopRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());

        let request = request.unwrap();
        assert_eq!(request.eeprom, None);
    }

    #[test]
    fn test_led_request_deserialization() {
        let json_str = r##"{
            "ledID": 2,
            "color": "#FF5733",
            "forward": true,
            "pulseFrequenz": 10
        }"##;

        let request: Result<crate::models::LedRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());

        let request = request.unwrap();
        assert_eq!(request.led_id, 2);
        assert_eq!(request.color, "#FF5733");
        assert_eq!(request.forward, true);
        assert_eq!(request.pulse_frequenz, 10);
    }

    #[test]
    fn test_led_request_field_rename() {
        // Test that ledID maps to led_id
        let json_str = r##"{
            "ledID": 1,
            "color": "#000000",
            "forward": false,
            "pulseFrequenz": 5
        }"##;

        let request: Result<crate::models::LedRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_ok());
    }

    #[test]
    fn test_success_response_serialization() {
        let response = crate::models::SuccessResponse {
            status: "success".to_string(),
            sent: Some("UPDATE(1, 100, 50, 30, 1)".to_string()),
            arduino_response: Some("OK".to_string()),
            message: None,
            parameters: None,
            data: None,
        };

        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["status"], "success");
        assert_eq!(json["sent"], "UPDATE(1, 100, 50, 30, 1)");
        assert_eq!(json["arduino_response"], "OK");
        assert!(json.get("message").is_none()); // Should be omitted
    }

    #[test]
    fn test_success_response_with_data() {
        let response = crate::models::SuccessResponse {
            status: "success".to_string(),
            sent: None,
            arduino_response: None,
            message: Some("Data retrieved".to_string()),
            parameters: None,
            data: Some(json!({"temperature": 25.5})),
        };

        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["data"]["temperature"], 25.5);
    }

    #[test]
    fn test_error_response_serialization() {
        let response = crate::models::ErrorResponse {
            status: "error".to_string(),
            message: "Arduino not connected".to_string(),
        };

        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json["status"], "error");
        assert_eq!(json["message"], "Arduino not connected");
    }

    #[test]
    fn test_update_request_invalid_missing_field() {
        let json_str = r#"{
            "power": 100,
            "charge": 50
        }"#;

        let request: Result<crate::models::UpdateRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_err()); // Should fail - missing required fields
    }

    #[test]
    fn test_led_request_invalid_type() {
        let json_str = r##"{
            "ledID": "not a number",
            "color": "#FF5733",
            "forward": true,
            "pulseFrequenz": 10
        }"##;

        let request: Result<crate::models::LedRequest, _> = serde_json::from_str(json_str);
        assert!(request.is_err()); // Should fail - wrong type
    }
}
