# Testing Guide

Complete guide to the test suite for the Arduino Web Server.

## Test Overview

**Total Tests: 57**

- Unit tests: 40 (in src/ modules)
- Integration tests: 11 (tests/integration_tests.rs)
- End-to-end tests: 6 (tests/e2e_tests.rs)

**Test Pass Rate: 100%**

## Running Tests

### Basic Commands

```bash
# Run all tests
cargo test

# Run with output (see println!)
cargo test -- --nocapture

# Run specific test
cargo test test_hex_to_rgb_with_hash

# Run tests matching pattern
cargo test hex_to_rgb

# List all tests
cargo test -- --list
```

### Run Specific Test Suites

```bash
# Unit tests only
cargo test --lib

# Integration tests only
cargo test --test integration_tests

# End-to-end tests only
cargo test --test e2e_tests

# All integration + e2e tests
cargo test --tests
```

### Advanced Options

```bash
# Run sequentially (useful for debugging)
cargo test -- --test-threads=1

# Show test names as they run
cargo test -- --nocapture --test-threads=1

# Run ignored tests
cargo test -- --ignored

# Run quietly
cargo test --quiet
```

## Test Organization

### Unit Tests (40 tests)

Located in source files with `#[cfg(test)]` attribute.

#### src/utils/tests.rs (27 tests)

**Converter Tests (11 tests):**

- `test_hex_to_rgb_with_hash` - "#FF5733" → (255, 87, 51)
- `test_hex_to_rgb_without_hash` - "FF5733" → (255, 87, 51)
- `test_hex_to_rgb_lowercase` - "ff5733" works
- `test_hex_to_rgb_mixed_case` - "Ff5733" works
- `test_hex_to_rgb_white` - "#FFFFFF" → (255, 255, 255)
- `test_hex_to_rgb_black` - "#000000" → (0, 0, 0)
- `test_hex_to_rgb_blue` - "#0000FF" → (0, 0, 255)
- `test_hex_to_rgb_invalid_length` - "FFF" returns error
- `test_hex_to_rgb_too_long` - "FF5733AA" returns error
- `test_hex_to_rgb_invalid_chars` - "GGGGGG" returns error
- `test_hex_to_rgb_empty` - "" returns error

**Formatter Tests (16 tests):**

- `test_make_update_string` - Creates "UPDATE(1, 100, 50, 30, 1)"
- `test_make_update_string_zeros` - Handles zero values
- `test_make_update_string_large_values` - Handles large numbers
- `test_make_led_string` - Creates "LED(1, 1, 255, 87, 51, 5)"
- `test_make_led_string_backward` - forward=false → 0
- `test_make_led_string_zero_freq` - Handles freq=0
- `test_format_response_valid` - Parses "CMD: {...}"
- `test_format_response_simple` - Parses "CMD: {}"
- `test_format_response_array` - Parses arrays
- `test_format_response_invalid_json` - Handles bad JSON
- `test_format_response_no_colon` - Handles missing colon
- `test_format_response_empty_json` - Handles empty JSON
- Plus 4 more edge cases

#### src/models/tests.rs (11 tests)

**Request Tests:**

- `test_update_request_deserialization` - JSON → UpdateRequest
- `test_update_request_default_active` - active defaults to 1
- `test_update_request_invalid_missing_field` - Missing field fails
- `test_stop_request_with_eeprom` - With EEPROM value
- `test_stop_request_without_eeprom` - Without EEPROM
- `test_led_request_deserialization` - JSON → LedRequest
- `test_led_request_field_rename` - camelCase → snake_case
- `test_led_request_invalid_type` - Wrong type fails

**Response Tests:**

- `test_success_response_serialization` - SuccessResponse → JSON
- `test_success_response_with_data` - With data field
- `test_error_response_serialization` - ErrorResponse → JSON

#### src/serial/tests.rs (6 tests)

- `test_update_command_format` - Verify UPDATE format
- `test_stop_command_format` - Verify STOP format
- `test_led_command_format` - Verify LED format
- `test_led_command_backward` - LED with backward
- `test_scan_command_format` - Verify SCAN format
- `test_command_has_no_delimiters` - No `<>` in command string

### Integration Tests (11 tests)

Located in `tests/integration_tests.rs`. Tests API endpoints with mock router (no real Arduino).

**Endpoint Tests:**

- `test_update_endpoint_no_arduino` - Returns 503
- `test_update_with_default_active` - active defaults to 1
- `test_update_endpoint_invalid_json` - Returns 400
- `test_stop_endpoint_no_arduino` - Returns 503
- `test_stop_endpoint_with_eeprom` - Accepts eeprom
- `test_led_endpoint_no_arduino` - Returns 503
- `test_led_endpoint_invalid_color` - Returns 503 (connection checked first)
- `test_scan_endpoint_no_arduino` - Returns 503

**General Tests:**

- `test_cors_headers` - CORS headers present
- `test_missing_content_type` - Returns 400
- `test_wrong_http_method` - Returns 405

**Note:** Tests use mock state with no Arduino, so validation errors appear as 503 (connection check happens before validation).

### End-to-End Tests (6 tests)

Located in `tests/e2e_tests.rs`. Tests complete system behavior.

- `test_server_starts` - Server initializes
- `test_all_endpoints_respond` - All 4 endpoints return responses
- `test_route_not_found` - Unknown route returns 404
- `test_concurrent_requests` - Multiple simultaneous requests work
- `test_content_type_validation` - Missing Content-Type returns 400
- `test_json_error_responses` - Error responses are JSON

## Test Structure

### Unit Test Example

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_to_rgb_with_hash() {
        let result = hex_to_rgb("#FF5733");
        assert_eq!(result, Ok((255, 87, 51)));
    }
}
```

### Async Integration Test Example

```rust
#[tokio::test]
async fn test_update_endpoint_no_arduino() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"power":100,"charge":50,"time":30,"eeprom":1}"##))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}
```

### Test Utilities

Located in `tests/common/mod.rs`:

```rust
pub fn create_test_router() -> Router {
    let mock_state = AppState {
        arduino: Arc::new(Mutex::new(None)),  // No Arduino connection
    };

    Router::new()
        .route("/api/update", post(update))
        .route("/api/stop", post(stop))
        .route("/api/led", post(led))
        .route("/api/scan", get(scan))
        .layer(CorsLayer::permissive())
        .with_state(mock_state)
}
```

## Test Coverage

### What's Tested ✅

- **Utilities:**

  - Hex color conversion (all cases)
  - Command string formatting
  - Response parsing

- **Models:**

  - JSON serialization/deserialization
  - Field renaming (camelCase ↔ snake_case)
  - Default values
  - Invalid input handling

- **Serial:**

  - Command format validation
  - Protocol compliance

- **API Endpoints:**

  - All 4 endpoints
  - Error responses (no Arduino)
  - CORS headers
  - Invalid requests

- **System:**
  - Server startup
  - Concurrent requests
  - Route handling

### Not Tested ❌

(Requires real hardware)

- Actual serial port communication
- Arduino responses
- Connection monitoring/reconnection
- Real hardware errors

## Writing New Tests

### Adding Unit Test

Add to existing test module:

```rust
// In src/utils/converters.rs

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_converter_function() {
        let result = new_function("input");
        assert_eq!(result, expected);
    }
}
```

### Adding Integration Test

Add to `tests/integration_tests.rs`:

```rust
#[tokio::test]
async fn test_new_endpoint() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/newroute")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"key":"value"}"##))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
}
```

## Troubleshooting

### Tests Pass Locally but Fail in CI

**Cause:** Timing issues or environment differences

**Solution:** Ensure tests don't depend on external state or timing

### Test Hangs

**Cause:** Deadlock or infinite wait

**Solution:**

```bash
# Run with timeout
cargo test -- --test-threads=1 --nocapture
# Then Ctrl+C to see where it hangs
```

### "Unused Import" Warning

**Fix:** Remove unused imports from test files

### Raw String Literal Issues

When using JSON in tests with `#` characters:

```rust
// Use double ## delimiters
let json = r##"{"color": "#FF5733"}"##;
```

## Continuous Integration

For CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run tests
  run: cargo test --all --verbose

- name: Check formatting
  run: cargo fmt --check

- name: Run clippy
  run: cargo clippy -- -D warnings
```

## Test Performance

Current test suite performance:

```
Running unittests src\lib.rs:      ~0.01s
Running unittests src\main.rs:     ~0.01s
Running tests\e2e_tests.rs:        ~0.00s
Running tests\integration_tests.rs: ~0.00s
-------------------------------------------
Total:                             ~0.02s
```

Fast enough for TDD workflow.

## Best Practices

1. **Test naming:** Use descriptive names explaining what is tested
2. **Arrange-Act-Assert:** Structure tests clearly
3. **One assertion per test:** Keep tests focused
4. **Test edge cases:** Empty strings, zeros, boundaries
5. **Test error cases:** Invalid input should fail gracefully
6. **Don't test external code:** Focus on your code
7. **Keep tests fast:** Mock external dependencies

## Related Documentation

- [Architecture](Architecture.md) - Understanding the system design
- [Setup Guide](Setup-Guide.md) - Running the project
- [API Reference](API-Reference.md) - Endpoint specifications
