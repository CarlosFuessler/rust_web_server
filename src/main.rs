use axum::{
    extract::Path,
    routing::{get, post},
    Json, Router,
};
use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api", get(root))
        .route("/api/hello/:name", get(hello))
        .route("/api/json", post(handle_json))
        .route("/api/python_calc/:num", get(python_calc))
        .nest_service("/", ServeDir::new("src/frontend/build"));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3020));
    println!("Server running at http://{}", addr);

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
        message: format!(
            "Hello, {}! You are {} years old.",
            payload.name, payload.age
        ),
    })
}

async fn python_calc(Path(num): Path<u32>) -> String {
    pyo3::prepare_freethreaded_python();
    Python::with_gil(|py| {
        match (|| -> PyResult<String> {
            let sys = py.import_bound("sys")?;
            let path = sys.getattr("path")?;
            path.call_method1("append", ("src",))?;

            let calc = py.import_bound("calc")?;
            let result = calc.call_method1("square", (num,))?;
            Ok(result.to_string())
        })() {
            Ok(msg) => msg,
            Err(e) => format!("Python error: {}", e),
        }
    })
}
