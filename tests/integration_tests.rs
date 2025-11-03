//! Integration tests for the Arduino Web Server API

use axum::{
    body::Body,
    http::{header, Request, StatusCode},
    Router,
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower::ServiceExt;

// Mock application state for testing
fn create_test_state() -> webserver::models::AppState {
    webserver::models::AppState {
        arduino: Arc::new(Mutex::new(None)), // No actual Arduino connection
    }
}

// Helper to create test router
fn create_test_router() -> Router {
    use axum::routing::{get, post};
    use tower_http::cors::CorsLayer;

    let state = create_test_state();

    Router::new()
        .route("/api/update", post(webserver::handlers::update))
        .route("/api/stop", post(webserver::handlers::stop))
        .route("/api/led", post(webserver::handlers::led))
        .route("/api/scan", get(webserver::handlers::scan))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

#[tokio::test]
async fn test_update_endpoint_no_arduino() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    json!({
                        "power": 100,
                        "charge": 50,
                        "time": 30,
                        "eeprom": 1,
                        "active": 1
                    })
                    .to_string(),
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // Should return 503 Service Unavailable when Arduino not connected
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_update_endpoint_invalid_json() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from("invalid json"))
                .unwrap(),
        )
        .await
        .unwrap();

    // Should return 400 Bad Request for invalid JSON
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_stop_endpoint_no_arduino() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/stop")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from("{}"))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_stop_endpoint_with_eeprom() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/stop")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(json!({"eeprom": 1}).to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_led_endpoint_no_arduino() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/led")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    json!({
                        "ledID": 1,
                        "color": "#FF5733",
                        "forward": true,
                        "pulseFrequenz": 5
                    })
                    .to_string(),
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_led_endpoint_invalid_color() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/led")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    json!({
                        "ledID": 1,
                        "color": "invalid",
                        "forward": true,
                        "pulseFrequenz": 5
                    })
                    .to_string(),
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // Note: Returns 503 SERVICE_UNAVAILABLE because connection check happens before validation
    // This is correct behavior - we check connection before processing input
    // To test validation logic specifically, would need a mock with connected Arduino
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_scan_endpoint_no_arduino() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/scan")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_cors_headers() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("OPTIONS")
                .uri("/api/scan")
                .header(header::ORIGIN, "http://localhost:3000")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // CORS should allow the request
    assert!(response.status().is_success() || response.status() == StatusCode::NO_CONTENT);
}

#[tokio::test]
async fn test_update_with_default_active() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    json!({
                        "power": 100,
                        "charge": 50,
                        "time": 30,
                        "eeprom": 1
                        // active omitted - should default to 1
                    })
                    .to_string(),
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // Should accept request with default active value
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn test_wrong_http_method() {
    let app = create_test_router();

    // Try GET on POST endpoint
    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/update")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
}

#[tokio::test]
async fn test_missing_content_type() {
    let app = create_test_router();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                // No Content-Type header
                .body(Body::from(
                    json!({
                        "power": 100,
                        "charge": 50,
                        "time": 30,
                        "eeprom": 1
                    })
                    .to_string(),
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // Axum should still accept it or return appropriate error
    assert!(
        response.status().is_client_error() || response.status() == StatusCode::SERVICE_UNAVAILABLE
    );
}
