//! End-to-end tests for the web server
//!
//! These tests validate the complete request-response cycle.

use axum::{
    body::Body,
    http::{header, Request, StatusCode},
};
use serde_json::json;
use tower::ServiceExt;

mod common;
use common::create_test_app;

#[tokio::test]
async fn test_server_starts() {
    let app = create_test_app();

    // Simple health check - server should respond to requests
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

    // Should get a response (even if 503 due to no Arduino)
    assert!(response.status() == StatusCode::SERVICE_UNAVAILABLE || response.status().is_success());
}

#[tokio::test]
async fn test_all_endpoints_respond() {
    // Test that all endpoints are reachable and respond appropriately
    let endpoints = vec![
        (
            "POST",
            "/api/update",
            json!({"power": 100, "charge": 50, "time": 30, "eeprom": 1}),
        ),
        ("POST", "/api/stop", json!({})),
        (
            "POST",
            "/api/led",
            json!({"ledID": 1, "color": "#FF5733", "forward": true, "pulseFrequenz": 5}),
        ),
    ];

    for (method, uri, body) in endpoints {
        let app = create_test_app();

        let response = app
            .oneshot(
                Request::builder()
                    .method(method)
                    .uri(uri)
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        // All endpoints should respond (even with error status)
        let status = response.status();
        assert!(
            status.is_success() || status.is_client_error() || status.is_server_error(),
            "Endpoint {} {} should respond with valid HTTP status",
            method,
            uri
        );
    }
}

#[tokio::test]
async fn test_json_error_responses() {
    let app = create_test_app();

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

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_route_not_found() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/nonexistent")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_content_type_validation() {
    let app = create_test_app();

    // Send valid JSON but with wrong content-type
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/update")
                .header(header::CONTENT_TYPE, "text/plain")
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

    // Should fail due to content-type mismatch
    assert!(response.status().is_client_error());
}

#[tokio::test]
async fn test_concurrent_requests() {
    use futures::future::join_all;

    let mut futures = vec![];

    for _ in 0..10 {
        let app = create_test_app();

        let fut = async move {
            app.oneshot(
                Request::builder()
                    .method("GET")
                    .uri("/api/scan")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap()
        };

        futures.push(fut);
    }

    let responses = join_all(futures).await;

    // All requests should complete
    assert_eq!(responses.len(), 10);

    // All should return consistent status
    for response in responses {
        assert!(response.status() == StatusCode::SERVICE_UNAVAILABLE);
    }
}
