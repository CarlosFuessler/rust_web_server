use axum::{
    routing::{get, post},
    Json, Router,
    extract::Path,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    // Build the router
    let app = Router::new()
        // API routes
        .route("/api", get(root))
        .route("/api/hello/:name", get(hello))
        .route("/api/json", post(handle_json))
        // Serve static files from the React build directory
        .nest_service("/", ServeDir::new("src/frontend/build"));

    // Specify the address to listen on
    let addr = SocketAddr::from(([127, 0, 0, 1], 3020));
    println!("Server running at http://{}", addr);
    
    // Start the server with axum 0.7 syntax
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Welcome to the Rust Web Server API!"
}

async fn hello(Path(name): Path<String>) -> String {
    format!("Hello, {}!", name)
}

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