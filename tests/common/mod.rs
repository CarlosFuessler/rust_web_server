//! Common test utilities

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

pub fn create_test_app() -> Router {
    let state = webserver::models::AppState {
        arduino: Arc::new(Mutex::new(None)),
    };

    Router::new()
        .route("/api/update", post(webserver::handlers::update))
        .route("/api/stop", post(webserver::handlers::stop))
        .route("/api/led", post(webserver::handlers::led))
        .route("/api/scan", get(webserver::handlers::scan))
        .layer(CorsLayer::permissive())
        .with_state(state)
}
