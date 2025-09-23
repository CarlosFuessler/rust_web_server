use axum::{
    routing::{get, post},
    Json, Router, Server
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Build the router
    let app = Router::new()
        .route("/", get(root))
        .route("/hello/:name", get(hello))
        .route("/json", post(handle_json));
    // Specify the address to listen on
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{}", addr);
    // Start the server
    Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
// Root handler
async fn root() -> &'static str {
    "Welcome to the Rust Web Server!"
}
// Dynamic route handler
async fn hello(axum::extract::Path(name): axum::extract::Path<String>) -> String {
    format!("Hello, {}!", name)
}
// JSON handler
#[derive(Deserialize)]
struct InputData {
    name: String,
    age: u8,
}
#[derive(Serialize)]
struct ResponseData {
    message: String,
}
async fn handle_json(Json(payload): Json<InputData>) -> Json<ResponseData> {
    Json(ResponseData {
        message: format!("Hello, {}! You are {} years old.", payload.name, payload.age),
    })
}