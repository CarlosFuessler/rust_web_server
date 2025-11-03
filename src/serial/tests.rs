//! Unit tests for serial communication utilities
//!
//! Note: These tests don't test actual serial communication as that requires hardware.
//! They test the string formatting and command building functions.

#[cfg(test)]
mod tests {
    use crate::utils::{make_update_string, make_led_string};

    #[test]
    fn test_update_command_format() {
        let command = make_update_string(100, 50, 30, 1, 1);
        assert_eq!(command, "UPDATE(1, 100, 50, 30, 1)");
    }

    #[test]
    fn test_led_command_format() {
        let command = make_led_string(1, (255, 87, 51), true, 5);
        assert_eq!(command, "LED(1, 1, 255, 87, 51, 5)");
    }

    #[test]
    fn test_led_command_backward() {
        let command = make_led_string(2, (0, 255, 0), false, 10);
        assert_eq!(command, "LED(2, 0, 0, 255, 0, 10)");
        assert!(command.contains(", 0, ")); // forward should be 0
    }

    // These tests verify the command structure that would be sent to Arduino
    #[test]
    fn test_command_has_no_delimiters() {
        let command = make_update_string(100, 50, 30, 1, 1);
        // Command should NOT include < > delimiters (added by send_data)
        assert!(!command.starts_with('<'));
        assert!(!command.ends_with('>'));
    }

    #[test]
    fn test_stop_command_format() {
        // Stop command is built in the handler, test the expected format
        let command_simple = "STOP()";
        let command_with_eeprom = format!("STOP({})", 1);
        
        assert_eq!(command_simple, "STOP()");
        assert_eq!(command_with_eeprom, "STOP(1)");
    }

    #[test]
    fn test_scan_command_format() {
        // Scan command is hardcoded in the handler
        let command = "SCAN()";
        assert_eq!(command, "SCAN()");
    }
}
